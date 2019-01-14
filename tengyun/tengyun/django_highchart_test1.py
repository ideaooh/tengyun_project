# -*- coding: utf-8 -*-
from django.http import HttpResponse
from django.shortcuts import render_to_response, render
import pymysql
import json


def show_web(request):
    results = []
    json_data = {}
    db = pymysql.connect(
        "123.206.81.19",
        "root",
        "oracle",
        "test"
    )
    cursor = db.cursor()
    sql = "select count from django_highcharts where location='tokyo' order by `datetime`"
    cursor.execute(sql)
    for i in cursor.fetchall():
        results.append(int(i[0]))

    #json_data['tokyo_data'] = results

    return render(request, "django_highchart_test1.html", {
        "tokyo_data": json.dumps(results)
    })