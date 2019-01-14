# -*- coding: utf-8 -*-
from django.http import HttpResponse
from django.shortcuts import render, render_to_response
import pymysql


def index_page(request):
    return render_to_response("cvm_ticket_analysis.html")