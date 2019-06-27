import { Component } from '@angular/core';

import * as signalR from '@aspnet/signalr';
import * as socketIO from 'socket.io-client';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  //signal R
  connection: signalR.HubConnection;
  chatRoomUrl = 'http://localhost:57099/chat';
  currentRoom: string;
  chatHistoryList: any[] = [];

  //socket io
  socket: SocketIOClient.Socket
  socketUrl = 'http://ec2-54-255-249-73.ap-southeast-1.compute.amazonaws.com:8050';
  userId = 1;
  notificationHistoryList: any[] = [];

  ngOnInit() {
    this.initSignalR();
    this.initSocketIO();
  }

  //Signal R
  initSignalR() {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(this.chatRoomUrl)
      .build();

    this.connection.start()
      .then(() => {
        console.log('connected to signalR')
        this.listenToBroadcast();
      })

  }

  listenToBroadcast() {
    if (this.connection) {
      console.log('listening to Signal R broadcast')
      this.connection.on('broadcastMessage', (name, message) => {
        console.log(`${name}: ${message}`);
        this.chatHistoryList.push({
          name: name,
          message: message
        });
      })
    }
  }

  sendMessage(message) {
    if (message.value) {
      this.connection.invoke('send', this.currentRoom, 'angular', message.value)
    }
  }

  joinRoom(room) {
    if (room.value) {
      this.currentRoom = room.value;
      this.connection.invoke('joinroom', room.value)
    }
  }

  //Socket IO
  initSocketIO() {
    this.socket = socketIO(this.socketUrl, {
      transports: ['websocket'],
      path: '/socket.io',
    });

    this.socket.on('connect', () => {
      console.log('connected to socket')
      this.joinNotificationRoom();
    });
  }

  joinNotificationRoom() {
    this.socket.emit('userConnect', {
      UserId: this.userId
    })
    this.listenToNotification();
  }

  listenToNotification() {
    console.log('listening to socket notification')
    this.socket.on('frontEndNotif', (data) => {
      console.log(data)
      this.notificationHistoryList.push({
        name: 'Socket',
        message: data['title'] + ' ' + data['description']
      })
  })
  }
}
