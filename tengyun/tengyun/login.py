# -*- coding: utf-8 -*-
from django.shortcuts import  render, render_to_response, redirect
from django.views.decorators import csrf
import pymysql

#连接数据库
class mgr_db:
    #连接数据库
    def conn_db(self):
        db = pymysql.connect("123.206.81.19", "root", "oracle", "auth", charset='utf8')
        return db.cursor()
    #查询数据库，返回列表
    def select_db(self, cursor, sql):
        cursor.execute(sql)
        return cursor.fetchall()

#检测登录信息
def check_login(request):
    db = mgr_db()
    cursor = db.conn_db()
    if request.POST:
        username = request.POST['username']
        passwd = request.POST['password']
        sql = "select pwd from auth_outlook where username='" + username + "'"
        results = db.select_db(cursor, sql)
        if results[0][0] == passwd:
            return 0
        else:
            return 1

#登录页面
def login_index(request):
    #return render(request, "post.html", ctx)
    ctx = {}
    ctx['wrong_info'] = "错误的用户名或密码"
    if check_login(request) == 0:
        return redirect("/index")
    else:
        return render(request, "login_index.html", ctx)
