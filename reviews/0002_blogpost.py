from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('reviews', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='BlogPost',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('slug', models.SlugField(allow_unicode=True, max_length=140, unique=True)),
                ('title', models.CharField(max_length=200)),
                ('category', models.CharField(blank=True, max_length=100)),
                ('date', models.CharField(blank=True, max_length=40)),
                ('reading_time', models.CharField(blank=True, max_length=60)),
                ('author', models.CharField(blank=True, max_length=120)),
                ('image', models.CharField(blank=True, max_length=300)),
                ('image_caption', models.CharField(blank=True, max_length=300)),
                ('excerpt', models.TextField(blank=True)),
                ('sections', models.JSONField(default=list)),
                ('is_published', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'ordering': ['-id'],
                'verbose_name': 'مقاله وبلاگ',
                'verbose_name_plural': 'مقالات وبلاگ',
            },
        ),
    ]