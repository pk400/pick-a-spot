# -*- coding: utf-8 -*-
# Generated by Django 1.9.5 on 2016-04-11 22:13
from __future__ import unicode_literals

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0031_auto_20160411_2209'),
    ]

    operations = [
        migrations.AlterField(
            model_name='roominstance',
            name='expirydate',
            field=models.DateTimeField(blank=True, default=datetime.datetime(2016, 4, 12, 22, 13, 39, 513465)),
        ),
    ]
