# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2016-03-12 23:34
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0005_auto_20160312_1833'),
    ]

    operations = [
        migrations.RenameField(
            model_name='friend',
            old_name='id',
            new_name='relationship_id',
        ),
    ]
