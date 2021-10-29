import { Injectable } from '@angular/core';
import {CapacitorSQLite, SQLiteConnection, SQLiteDBConnection} from '@capacitor-community/sqlite' 
import { Capacitor } from '@capacitor/core';

@Injectable()
export class DatabaseService {

  sqlite: SQLiteConnection
  plataform: string
  isService = false
  db: SQLiteDBConnection
  erros: Array<any> = []

  constructor() { 
    this.initializePlugin().then(result => this.erros.push('conectou ao plugin: ' + result))
    this.erros.push('sqlite plugin: ' + JSON.stringify(this.sqlite))
  }

  initializePlugin(): Promise<boolean>{
    return new Promise((resolve)=>{
      this.plataform = Capacitor.getPlatform()
      console.log(`*** plataform: ${this.plataform}***`)
      
      const sqlitePlugin = CapacitorSQLite
      this.sqlite  = new SQLiteConnection(sqlitePlugin)
      this.isService = true
      console.log(`isService: ${this.isService}`)

      resolve(true)
    })
  }

  async createConnection(
    database: string, 
    encrypted: boolean, 
    mode: string, 
    version: number): Promise<SQLiteDBConnection>{

      if(this.sqlite != null){
        try{

          const db: SQLiteDBConnection = await this.sqlite.createConnection(database, encrypted, mode, version)
          this.db = db

          if(db != null){
            return Promise.resolve(db)
          }
          else{
            this.erros.push('No db returned')
            return Promise.reject(new Error('No db returned'))
          }
        }catch(err){
          this.erros.push('erro ao criar db: ' + err)
          return Promise.reject(new Error(err))
        }
      }
  }

  async init(){
    await this.db.execute('create table if not exists palavras(id integer auto_increment primary key, palavra text, data text, definicao text)')
  }

  async closeConnection(database: string): Promise<void>{
    if(this.sqlite != null){
      try{
        await this.sqlite.closeConnection(database)
        return Promise.resolve()
      }
      catch(err){
        return Promise.reject(new Error(err))
      }
    }
    else{
      return Promise.reject(new Error('There is no connection to be close'))
    }
  }

  async retrieveConnection(database: string): Promise<SQLiteDBConnection>{
    if(this.sqlite != null){
      try{
        let db = await this.sqlite.retrieveConnection(database)
        return Promise.resolve(db)
      }
      catch(err){
        this.erros.push('erro ao recuperar db: ' + err)
        return Promise.reject(new Error(err))
      }
    }
    else{
      return Promise.reject(new Error('There is no connection to be close'))
    }
  }
}
