# Generated by Django 4.2.15 on 2024-11-12 13:13

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('user_management', '0026_auto_20241017_1919'),
    ]

    operations = [
        migrations.CreateModel(
            name='ServiceAccount',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('grafana_id', models.PositiveIntegerField()),
                ('login', models.CharField(max_length=300)),
                ('organization', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='service_accounts', to='user_management.organization')),
            ],
            options={
                'unique_together': {('grafana_id', 'organization')},
            },
        ),
    ]
