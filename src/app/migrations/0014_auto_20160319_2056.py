# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2016-03-19 20:56
from __future__ import unicode_literals

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0013_auto_20160319_1810'),
    ]

    operations = [
        migrations.AlterField(
            model_name='roominstance',
            name='expirydate',
            field=models.DateTimeField(blank=True, default=datetime.datetime(2016, 3, 20, 20, 56, 14, 794055)),
        ),
        migrations.AlterField(
            model_name='roominstance',
            name='listofpref',
            field=models.CharField(blank=True, max_length=9999999999999999, null=True),
        ),
        migrations.AlterField(
            model_name='roominstance',
            name='owner',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]
