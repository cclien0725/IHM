#-*- coding: utf-8 -*-
from lib.BeautifulSoup import BeautifulSoup
from django.utils import simplejson
from google.appengine.api import urlfetch
from google.appengine.ext import webapp
import re
import urllib

class Search(webapp.RequestHandler):

    def post(self):
        self.response.headers['Content-Type'] = 'text/plain;'
        NUM = 10
        q = self.request.get('q')
        qn = int(self.request.get('n'))
        
        param = {'q':'\"' + q.encode('utf8') + '\" site:mymedia.yam.com', 'num':10, 'start':qn * NUM}
        
        url = "http://www.google.com/search?" + urllib.urlencode(param)
        
        googleSearchResult = urlfetch.fetch(url)
        if googleSearchResult.status_code == 200:
            soup = BeautifulSoup(googleSearchResult.content, convertEntities=BeautifulSoup.HTML_ENTITIES)
            searchList = list()
            retList = list()
            
            for tag in soup.findAll('li', 'g'):
                if tag.find('h3', 'r') != None:
                    tmp = tag.find('cite').text
                    num = re.findall(r'mymedia.yam.com/m/([0-9]+)', tmp)
                    
                    if len(num) > 0:
                        tmp = tag.find('h3', 'r').text
                        name = re.sub(r'([- ]+)?(yam[- ]?[^\x00-\xff]+)-?([^\x00-\xff]+)?-?( yam [^\x00-\xff]+)?', '', tmp)
                        tmpList = list()
                        tmpList.append(num[0])
                        tmpList.append(name)
                        
                        searchList.append(tmpList)
                        
            for item in searchList:
                mediaAPI = "http://mymedia.yam.com/api/a/?pID="
                
                mymediaAPIResult = urlfetch.fetch(mediaAPI + item[0])
                
                if mymediaAPIResult.status_code == 200:
                    href = re.findall(r'mp3file=(.*)&', mymediaAPIResult.content)
                    if len(href) > 0:
                        tmpList = list()
                        tmpList.append(href[0])
                        tmpList.append(item[0])
                        tmpList.append(item[1])
                        
                        retList.append(tmpList)
                        
            self.response.out.write(simplejson.dumps(retList))
        else:
            self.response.out.write(googleSearchResult.content)
            
    def get(self):
        self.response.headers['Content-Type'] = 'text/plain;'
        sid = self.request.get('sid')
        
        mediaAPI = "http://mymedia.yam.com/api/a/?pID="
                
        mymediaAPIResult = urlfetch.fetch(mediaAPI + sid)
        
        retList = list();
        
        if mymediaAPIResult.status_code == 200:
            href = re.findall(r'mp3file=(.*)&', mymediaAPIResult.content)
            if len(href) > 0:
                retList.append(href[0])
                
        self.response.out.write(simplejson.dumps(retList))