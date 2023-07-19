# Generated by Django 3.2.20 on 2023-07-18 09:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('alerts', '0022_alter_alertgroup_manual_severity'),
    ]

    operations = [
        migrations.AlterModelManagers(
            name='alertgroup',
            managers=[
            ],
        ),
        migrations.RemoveIndex(
            model_name='alertgroup',
            name='alerts_aler_channel_ee84a7_idx',
        ),
        migrations.AlterField(
            model_name='alertgroup',
            name='is_archived',
            field=models.BooleanField(default=False, null=True),
        ),
        migrations.AddIndex(
            model_name='alertgroup',
            index=models.Index(fields=['channel_id', 'resolved', 'acknowledged', 'silenced', 'root_alert_group_id'], name='alerts_aler_channel_81aeec_idx'),
        ),
    ]