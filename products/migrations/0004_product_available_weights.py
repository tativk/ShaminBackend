from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        (&#39;products&#39;, &#39;0003_product_price_100_product_price_15_product_price_20_and_more&#39;),
    ]

    operations = [
        migrations.AddField(
            model_name=&#39;product&#39;,
            name=&#39;available_weights&#39;,
            field=models.JSONField(blank=True, null=True),
        ),
    ]