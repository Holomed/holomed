# -*- coding: utf-8 -*-
import socket
import pygame

host = "127.0.0.1"
port = 8888

s=socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.bind((host,port))
s.listen(1)

print 'Servidor conectado...'
cont = 0

while True:
    if cont > 100:
        cont = 0

    conn, addr = s.accept()
    message = []
    while True:
        data_received = conn.recv(1024*1024)
        if not data_received: 
            break
        else: 
            message.append(data_received)

    data = ''.join(message)
    image = pygame.image.fromstring(data,(640,480),"RGB")
    
    name_image = 'screenshots/screenshot{cont}.png'.format(cont=cont)
    cont += 1

    pygame.image.save(image, name_image)


