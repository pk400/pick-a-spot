from django.shortcuts import render

# Create your views here.
def home(request) :
	context = {
		'title': 'Home'
	}
	return render(request, 'home.html', context)

def browse(request):
	context = {
		'title': 'Browse',
		'data': [
			'McDonalds',
			'Tim Hortons',
			'Starbucks',
		]
	}
	return render(request, 'browse.html', context)