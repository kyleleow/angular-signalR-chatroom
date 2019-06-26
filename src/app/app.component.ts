import { Component } from '@angular/core';
import * as signalR from '@aspnet/signalr';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  connection: signalR.HubConnection;
  currentRoom: string;
  chatHistoryList: any[] = [];

  ngOnInit(){
    this.initSignalR();
  }

  initSignalR(){
    this.connection = new signalR.HubConnectionBuilder()
    .withUrl('http://localhost:57099/chat')
    .build();

    this.connection.start()
    .then(() => {
      console.log('connection started')
      this.listenToBroadcast();        
    })
    
  }

  listenToBroadcast(){
    if (this.connection){
      console.log('listening to broadcast')
      this.connection.on('broadcastMessage', (name, message) => {
        console.log(`${name}: ${message}`);
        this.chatHistoryList.push({
          name: name,
          message: message
        });
      })
    }
  }

  sendMessage(message){
    if (message.value){
      this.connection.invoke('send', this.currentRoom, 'angular', message.value)
    }
  }

  joinRoom(room){
    if (room.value){
      this.currentRoom = room.value;
      this.connection.invoke('joinroom', room.value)
    }
    
  }
}
