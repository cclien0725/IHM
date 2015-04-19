# -*- coding: utf-8 -*-
from datastore import PlayList, SongList
from google.appengine.api import users
from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from search import Search
import jinja2
import os

class DefaultPage(webapp.RequestHandler):
    
    def get(self):
        self.response.headers['Content-Type'] = 'text/html; charset=utf-8'
        template = jinja_environment.get_template('/template/index.html')
        
        if users.get_current_user():
            tmp = {'users': users }
            self.response.out.write(template.render(tmp))
            
        else:
            tmp = {'users': users }
            self.response.out.write(template.render(tmp))

application = webapp.WSGIApplication([('/search', Search),
                                      ('/playlist', PlayList),
                                      ('/songlist', SongList),
                                      ('/.*', DefaultPage)
                                      ], debug=True)

jinja_environment = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)))

def main():
    run_wsgi_app(application)

if __name__ == "__main__":
    main()
