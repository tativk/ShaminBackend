"""Repair the specific empty legacy-user database created before AUTH_USER_MODEL."""
from django.core.management.base import BaseCommand, CommandError
from django.db import connection, transaction
from django.db.migrations.executor import MigrationExecutor


class Command(BaseCommand):
    help = 'Apply missing accounts migration and repoint the empty admin log, without deleting tables.'

    def handle(self, *args, **options):
        if connection.vendor != 'postgresql':
            raise CommandError('This repair is only for PostgreSQL.')
        with transaction.atomic():
            with connection.cursor() as cursor:
                cursor.execute('LOCK TABLE auth_user, django_admin_log, django_migrations IN ACCESS EXCLUSIVE MODE')
                for table in ['auth_user', 'django_admin_log']:
                    cursor.execute(f'SELECT COUNT(*) FROM {table}')
                    if cursor.fetchone()[0]:
                        raise CommandError('Legacy users/admin logs are not empty; a data migration is required.')
                executor = MigrationExecutor(connection)
                target = ('accounts', '0001_initial')
                if target in executor.loader.applied_migrations:
                    raise CommandError('Accounts migration already applied; this repair is not needed.')
                if any(t.startswith('accounts_') for t in connection.introspection.table_names(cursor)):
                    raise CommandError('Accounts tables already exist; refusing to overwrite them.')
                constraints = connection.introspection.get_constraints(cursor, 'django_admin_log')
                legacy = [name for name, value in constraints.items()
                          if value.get('foreign_key') == ('auth_user', 'id')]
                if len(legacy) != 1:
                    raise CommandError('Unexpected admin foreign key configuration.')
                state = executor.loader.project_state([target], at_end=False)
                executor.apply_migration(state, executor.loader.get_migration(*target))
                quote = connection.ops.quote_name
                cursor.execute(f'ALTER TABLE django_admin_log DROP CONSTRAINT {quote(legacy[0])}')
                cursor.execute('ALTER TABLE django_admin_log ADD CONSTRAINT admin_log_accounts_user_fk '
                               'FOREIGN KEY (user_id) REFERENCES accounts_user(id) DEFERRABLE INITIALLY DEFERRED')
                MigrationExecutor(connection).loader.check_consistent_history(connection)
        self.stdout.write(self.style.SUCCESS('Accounts schema applied; admin FK repaired. All legacy tables preserved.'))
