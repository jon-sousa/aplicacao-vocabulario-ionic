import { Component, OnDestroy, OnInit } from '@angular/core';
import {Platform} from '@ionic/angular'
import { DatabaseService } from './services/database.service';
import {database, encrypted, mode, version} from './config/db-config'


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnDestroy{
  constructor(private databaseService: DatabaseService, private platform: Platform) {
  }


  initializeApp(){
    this.platform.ready()
      .then(async () => {
        await this.databaseService.initializePlugin()
      })
      .catch(err => {
        console.log('erro ao conectar db: ' + err) 
        this.databaseService.erros.push(err)
      })
  }
  
  async ngOnDestroy(){
  }
}