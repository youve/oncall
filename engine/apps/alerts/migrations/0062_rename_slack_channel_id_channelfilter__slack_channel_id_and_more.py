# Generated by Django 4.2.16 on 2024-11-01 11:20

from django.db import migrations, models
import django.db.models.deletion
import django_migration_linter as linter

class Migration(migrations.Migration):

    dependencies = [
        ('slack', '0005_slackteamidentity__unified_slack_app_installed'),
        ('alerts', '0061_alter_alertgroup_resolved_by_alert'),
    ]

    operations = [
        linter.IgnoreMigration(),
        migrations.RenameField(
            model_name='channelfilter',
            old_name='slack_channel_id',
            new_name='_slack_channel_id',
        ),
        migrations.RenameField(
            model_name='resolutionnoteslackmessage',
            old_name='slack_channel_id',
            new_name='_slack_channel_id',
        ),
        migrations.AddField(
            model_name='channelfilter',
            name='slack_channel',
            field=models.ForeignKey(default=None, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='+', to='slack.slackchannel'),
        ),
        migrations.AddField(
            model_name='resolutionnoteslackmessage',
            name='slack_channel',
            field=models.ForeignKey(default=None, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='+', to='slack.slackchannel'),
        ),
    ]