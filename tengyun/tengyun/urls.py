"""tengyun URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.11/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import url
from django.contrib import admin
from . import view, search, search2, django_highchart_test1, mainblog
from . import index, cvm_ticket_analysis, login
from accounts import views as accounts_views
from django.contrib.auth import views as auth_views
from boards import views as boards

urlpatterns = [
    url(r'^admin/', admin.site.urls),
    #####
    #实验体
    #####
    url(r'^search-form$', search.search_form),
    url(r'^search$', search.search),
    url(r'^search-post$', search2.search_post),
    url(r'^django_test1$', django_highchart_test1.show_web),
    #BNEWS论坛
    url(r'^$', mainblog.home, name='home'),
    url(r'^accounts/profile', mainblog.home),
    url(r'^boards/(?P<pk>\d+)/$', boards.board_topics, name='board_topics'),
    url(r'^boards/(?P<pk>\d+)/new/$', boards.new_topic, name='new_topic'),
    url(r'^boards/(?P<pk>\d+)/topics/(?P<topic_pk>\d+)/$', boards.topic_posts, name='topic_posts'),
    url(r'^boards/(?P<pk>\d+)/topics/(?P<topic_pk>\d+)/reply/$', boards.reply_topic, name='reply_topic'),
    url(r'^boards/(?P<pk>\d+)/topics/(?P<topic_pk>\d+)/posts/(?P<post_pk>\d+)/edit/$',
        boards.PostUpdateView.as_view(), name='edit_post'),
    url(r'^boards/(?P<pk>\d+)/$', boards.TopicListView.as_view(), name='board_topics'),
    url(r'^admin/', admin.site.urls),
    url(r'^signup/$', accounts_views.signup, name='signup'),
    url(r'^logout/$', auth_views.LogoutView.as_view(), name='logout'),
    url(r'^login/$', auth_views.LoginView.as_view(template_name='login.html'), name='login'),
    url(r'^reset/$',
        auth_views.PasswordResetView.as_view(
            template_name='password_reset.html',
            email_template_name='password_reset_email.html',
            subject_template_name='password_reset_subject.txt'
        ),
        name='password_reset'),
    url(r'^settings/account/$', accounts_views.UserUpdateView.as_view(), name='my_account'),
    url(r'^reset/done/$',
        auth_views.PasswordResetDoneView.as_view(template_name='password_reset_done.html'),
        name='password_reset_done'),
    url(r'^reset/(?P<uidb64>[0-9A-Za-z_\-]+)/(?P<token>[0-9A-Za-z]{1,13}-[0-9A-Za-z]{1,20})/$',
        auth_views.PasswordResetConfirmView.as_view(template_name='password_reset_confirm.html'),
        name='password_reset_confirm'),
    url(r'^reset/complete/$',
        auth_views.PasswordResetCompleteView.as_view(template_name='password_reset_complete.html'),
        name='password_reset_complete'),
    url(r'^settings/password/$', auth_views.PasswordChangeView.as_view(template_name='password_change.html'),
        name='password_change'),
    url(r'^settings/password/done/$', auth_views.PasswordChangeDoneView.as_view(template_name='password_change_done.html'),
        name='password_change_done'),

    #url(r'^(?P<username>[\w.@+-]+)/$', mainblog.user_profile, name='user_profile'),
    #####
    #主体
    #####
    #登录页面
    #url(r'^login$', login.login_index),
    url(r'^login-post$', login.check_login),
    #首页
    url(r'^index$', index.index_page),
    #子机数据分析页面
    url(r'^cvm_ticket_analysis$', cvm_ticket_analysis.index_page),
]

