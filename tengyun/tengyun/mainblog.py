from django.http import HttpResponse
from django.shortcuts import render, redirect, get_object_or_404
from boards.models import Board, Topic, Post
from django.contrib.auth.models import User
#from django.forms import NewTopicForm

def home1(request):
    boards = Board.objects.all()
    boards_names = list()

    for board in boards:
        boards_names.append(board.name)

    response_html= '<br>'.join(boards_names)

    return HttpResponse(response_html)

def home(request):
    boards = Board.objects.all()
    return render(request, 'mainblog_html1.html', {'boards': boards})

def board_topics(request, pk):
    board = Board.objects.get(pk=pk)
    return render(request, 'topics.html', {'board': board})

'''
def new_topic(request, pk):
    board = get_object_or_404(Board, pk=pk)

    if request.method == 'POST':
        subject = request.POST['subject']
        message = request.POST['message']

        user = User.objects.first()

        topic = Topic.objects.create(
            subject=subject,
            board=board,
            starter=user
        )

        post = Post.objects.create(
            message=message,
            topic=topic,
            created_by=user
        )

        return redirect('board_topics', pk=board.pk)

    return render(request, 'new_topic.html', {'board': board})
'''

