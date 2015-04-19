#-*- coding: utf-8 -*-
from google.appengine.api import users
from google.appengine.ext import db, webapp

class DS_PlayList(db.Model):
    user = db.UserProperty()
    content = db.TextProperty()
    
class DS_SongList(db.Model):
    user = db.UserProperty()
    songname = db.StringProperty()
    content = db.TextProperty()

#===============================================================================
# DS_PlayList Function
#===============================================================================
def createPlayList(user, content):
    pl = DS_PlayList()
    pl.content = content
    pl.user = user
    pl.put()
    
def updatePlayList(user, content):
    pl = DS_PlayList.gql('WHERE user = :1', user).get()
    
    if pl == None:
        createPlayList(user, content)
    else:
        pl.content = content
        pl.put()

def deletePlayList(user):
    pl = DS_PlayList.gql('WHERE user = :1', user).get()
    pl.delete()
    
def getPlayList(user):
    pl = DS_PlayList.gql('WHERE user = :1', user).get()
    
    return pl
    
#===============================================================================
# DS_SongList Function
#===============================================================================
def createSongList(user, content, songname):
    sl = DS_SongList()
    sl.content = content
    sl.user = user
    sl.songname = songname
    sl.put()

def updateSongList(user, content, songname):
    sl = DS_SongList.gql('WHERE songname = :1 AND user = :2', songname, user).get()
    
    if sl == None:
        createSongList(user, content, songname)
    else:
        sl.content = content
        sl.put()

def deleteSongList(user, songname):
    sl = DS_SongList.gql('WHERE songname = :1 AND user = :2', songname, user).get()
    sl.delete()

def getSongList(user, songname):
    sl = DS_SongList.gql('WHERE songname = :1 AND user = :2', songname, user).get()
    return sl


#===============================================================================
# PlayList Request Handler
#===============================================================================
class PlayList(webapp.RequestHandler):
    def get(self):
        user = users.get_current_user()
        pl = getPlayList(user)
        
        if (pl == None):
            createPlayList(user, '["My playlist1","My playlist2","My playlist3"]')
            pl = getPlayList(user)
            
        self.response.headers['Content-Type'] = 'application/json;'
        self.response.out.write(pl.content)
        
    def post(self):
        user = users.get_current_user()
        content = self.request.get('p')
        updatePlayList(user, content)
#        self.response.out.write(user.nickname() + '\n' + content )
        
#===============================================================================
# SongList Request Handler        
#===============================================================================
class SongList(webapp.RequestHandler):
    def get(self):
        user = users.get_current_user()
        songname = self.request.get('n')
        sl = getSongList(user, songname)
        
        self.response.headers['Content-Type'] = 'application/json'
        if sl != None:
            self.response.out.write(sl.content)
        
    def post(self):
        user = users.get_current_user()
        songname = self.request.get('n')
        content = self.request.get('s')
        updateSongList(user, content, songname)
        
    def delete(self):
        user = users.get_current_user()
        songname = self.request.get('n')
        deleteSongList(user, songname)
        