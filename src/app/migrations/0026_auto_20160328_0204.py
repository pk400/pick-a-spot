# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2016-03-28 02:04
from __future__ import unicode_literals

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0025_auto_20160327_2050'),
    ]

    operations = [
        migrations.AlterField(
            model_name='roominstance',
            name='expirydate',
            field=models.DateTimeField(blank=True, default=datetime.datetime(2016, 3, 29, 2, 4, 11, 907709)),
        ),
    ]
