# -*- coding: utf-8 -*-
from django.http import HttpResponse
from django.shortcuts import render
import pymysql

'''
cvm_ticket_count    首页子机工单总数
weekly_solved_count 周解决故障总数
keyword_count       关键词积累总数
host_ticket_count   母机工单总数
client_ticket_count 客户自身问题总数
product_ticket_count    平台产品类问题总数

index_info          首页渲染用字典

vip_problem_count   大客户故障总数
p_str               大客户故障top3标签数
'''
#连接数据库
class mgr_db:
    #连接数据库
    def conn_db(dbname):
        db = pymysql.connect("123.206.81.19", "root", "oracle", dbname, charset='utf8')
        return db.cursor()
    #查询数据库，返回列表
    def select_db(cursor, sql):
        cursor.execute(sql)
        return cursor.fetchall()

#填充首页五个方框数据字段
def index_data():
    cursor = mgr_db.conn_db("cvm_ticket")
    #查询子机工单总数
    results = mgr_db.select_db(cursor, "select count(*) from cvm_ticket_all")
    cvm_ticket_count = results[0][0]
    #查询大客户子机故障总数
    results = mgr_db.select_db(cursor, "select count(*) from cvm_ticket_all where t_crm_grade not like '%普通%'")
    vip_ticket_count = results[0][0]
    #查询关键词积累总数
    results = mgr_db.select_db(cursor, "select count(*) from cvm_ticket_all where keyword != ''")
    keyword_count = results[0][0]
    #查询客户自身问题总数
    results = mgr_db.select_db(cursor, "select count(*) from cvm_ticket_all where sec_analysis like '%客户%'")
    client_ticket_count = results[0][0]
    #查询平台产品类问题总数
    results = mgr_db.select_db(cursor, "select count(*) from cvm_ticket_all where sec_analysis like '%平台%'")
    product_ticket_count = results[0][0]
    #查询母机工单总数
    cursor = mgr_db.conn_db("M-server_ticket")
    results = mgr_db.select_db(cursor, "select count(*) from old_master_ticket_all")
    host_ticket_count = results[0][0]
    return cvm_ticket_count, vip_ticket_count, keyword_count, host_ticket_count, client_ticket_count, product_ticket_count

#大客户故障数据分析
def vip_client_analysis(client_name):
    cursor = mgr_db.conn_db("cvm_ticket")
    sql = "select third_analysis from cvm_ticket_all where t_title like '%" + client_name + "%'"
    results = mgr_db.select_db(cursor, sql)
    words = []
    for i in results:
        for a in i[0].split("."):
            if a == "拼多多":
                continue
            words.append(a)
    counts = {}
    for word in words:
        if len(word) == 1:
            continue
        else:
            counts[word] = counts.get(word, 0) + 1
    items = list(counts.items())
    items.sort(key=lambda x: x[1], reverse=True)
    p_str = ''
    try:
        for i in range(3):
            word, count = items[i]
            p_str = p_str + " | " + word
    except:
        for key, value in counts.items():
            p_str = p_str + key
    sql = "select count(*) from cvm_ticket_all where t_title like '%" + client_name + "%'"
    results = mgr_db.select_db(cursor, sql)
    vip_problem_count = results[0][0]
    return p_str, vip_problem_count

#首页粗粒度子机工单数据分析概览
def  coarsness_analysis(problem_name):

    cursor = mgr_db.conn_db("cvm_ticket")
    sql = "select count(*) from cvm_ticket_all where sec_analysis like '%" + problem_name + "%'"
    results = mgr_db.select_db(cursor, sql)
    problem_count = results[0][0]
    if problem_name == "转研发":
        sql = "select count(*) from cvm_ticket_all where third_analysis like '%转研发%'"
        results = mgr_db.select_db(cursor, sql)
        problem_count = str(int(results[0][0]) + int(problem_count))

    sql = "select third_analysis from cvm_ticket_all where sec_analysis like '%" + problem_name + "%'"
    results = mgr_db.select_db(cursor, sql)
    words = []
    for i in results:
        for a in i[0].split("."):
            if a == "拼多多":
                continue
            words.append(a)
    if problem_name == "转研发":
        sql = "select third_analysis from cvm_ticket_all where third_analysis like '%转研发%'"
        results = mgr_db.select_db(cursor, sql)
        for i in results:
            for a in i[0].split("."):
                if a == "拼多多":
                    continue
                elif a == "转研发":
                    continue
                else:
                    words.append(a)
    counts = {}
    for word in words:
        if len(word) == 1:
            continue
        else:
            counts[word] = counts.get(word, 0) + 1
    items = list(counts.items())
    items.sort(key=lambda x: x[1], reverse=True)
    problem_str = ''
    try:
        for i in range(3):
            word, count = items[i]
            problem_str = problem_str + " | " + word
    except:
        for key, value in counts.items():
            problem_str = problem_str + key
    return problem_str, problem_count



#首页呈现
def index_page(request):
    index_info = {}
    # 填充首页五个方框数据字段
    cvm_ticket_count, vip_ticket_count, keyword_count, host_ticket_count, client_ticket_count, product_ticket_count = index_data()
    index_info['cvm_ticket_count'] = str(cvm_ticket_count)
    index_info['vip_ticket_count'] = str(vip_ticket_count)
    index_info['keyword_count'] = str(keyword_count)
    index_info['host_ticket_count'] = str(host_ticket_count)
    index_info['client_ticket_count'] = str(client_ticket_count)
    index_info['product_ticket_count'] = str(product_ticket_count)
    # 大客户故障数据分析
    p_str_pdd, vip_problem_count_pdd = vip_client_analysis("拼多多")
    p_str_xhs, vip_problem_count_xhs = vip_client_analysis("小红书")
    p_str_mgj, vip_problem_count_mgj = vip_client_analysis("蘑菇街")
    p_str_wyht, vip_problem_count_wyht = vip_client_analysis("无忧互通")
    p_str_hnqy, vip_problem_count_hnqy = vip_client_analysis("海南祺曜")
    index_info['p_str_pdd'] = str(p_str_pdd)
    index_info['vip_problem_count_pdd'] = str(vip_problem_count_pdd)
    index_info['p_str_xhs'] = str(p_str_xhs)
    index_info['vip_problem_count_xhs'] = str(vip_problem_count_xhs)
    index_info['p_str_mgj'] = str(p_str_mgj)
    index_info['vip_problem_count_mgj'] = str(vip_problem_count_mgj)
    index_info['p_str_wyht'] = str(p_str_wyht)
    index_info['vip_problem_count_wyht'] = str(vip_problem_count_wyht)
    index_info['p_str_hnqy'] = str(p_str_hnqy)
    index_info['vip_problem_count_hnqy'] = str(vip_problem_count_hnqy)
    # 首页粗粒度子机工单数据分析概览
    problem_str_pt, problem_count_pt = coarsness_analysis("平台产品问题")
    problem_str_cl, problem_count_cl = coarsness_analysis("客户自身问题")
    problem_str_gq, problem_count_gq = coarsness_analysis("挂起")
    problem_str_aq, problem_count_aq = coarsness_analysis("系统安全问题")
    problem_str_zyf, problem_count_zyf = coarsness_analysis("转研发")
    index_info['problem_str_pt'] = str(problem_str_pt)
    index_info['problem_str_cl'] = str(problem_str_cl)
    index_info['problem_str_gq'] = str(problem_str_gq)
    index_info['problem_str_aq'] = str(problem_str_aq)
    index_info['problem_str_zyf'] = str(problem_str_zyf)
    index_info['problem_count_pt'] = str(problem_count_pt)
    index_info['problem_count_cl'] = str(problem_count_cl)
    index_info['problem_count_gq'] = str(problem_count_gq)
    index_info['problem_count_aq'] = str(problem_count_aq)
    index_info['problem_count_zyf'] = str(problem_count_zyf)





    return render(request, "index.html", index_info)



