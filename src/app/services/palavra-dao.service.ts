import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';
import { DatabaseService } from './database.service';
import {database, encrypted, mode, version} from '../config/db-config'

@Injectable({
  providedIn: 'root'
})
export class PalavraDaoService implements OnDestroy{

  db: SQLiteDBConnection
  erros: Array<any> = []

  constructor(private databaseService: DatabaseService) {
    this.erros = this.databaseService.erros
    console.log(this.databaseService.erros)

    /*
    this.conectar()
      .then(async openedDB => {
        this.db = openedDB
        await this.db.open()
        this.erros.push('db opened in palavraDao: ' + JSON.stringify(this.db))

      })
      .catch(err => {
        console.log(err)
        this.erros.push('erro ao criar conexao em palavraDao' + err)

        this.recuperarConexao()
          .then(async openedDB => {
              this.db = openedDB
              await this.db.open()
              this.erros.push('db opened in palavraDao: ' + JSON.stringify(this.db))
          })
          .catch(async err => {
            console.log(err)
            this.erros.push('erro ao recuperar conexao em palavraDao' + err)
            await this.databaseService.sqlite.closeAllConnections()
            this.db = await this.databaseService.createConnection(database, encrypted, mode, 2)
          })
      })
      */
  }

  conectar(): Promise<void>{
    return new Promise((resolve, reject) => {
      this.databaseService.initializePlugin()
      .then(result => {
        this.databaseService.createConnection(database, encrypted, mode, version)
        .then(async db =>{
          this.db = db
          await this.db.open()
          this.erros.push('sqlite plugin: ' + JSON.stringify(this.databaseService.sqlite))
          this.erros.push('db connection: ' + JSON.stringify(this.db))
          await this.db.execute("create table if not exists palavras(id integer primary key autoincrement, palavra text, data text, definicao text)")
          return resolve()
        })
        .catch(err => { 
          this.erros.push('erro ao criar a tabela: '+ err)
          return reject()
        })
      })
    })
  }

  recuperarConexao(){
    return this.databaseService.initializePlugin()
      .then(() => {
        return this.databaseService.retrieveConnection(database)
          .then(async openedDB => Promise.resolve(openedDB))
          .catch(erro => { return Promise.reject(erro)})
      })
      .catch(erro => { return Promise.reject(erro)})
  }

  async inserirPalavra(palavra: string, definicao?: string){

    try{  
      let data = new Date().toLocaleDateString().split('/').reverse().join('-')
  
      if(definicao){
        await this.db.run('insert into palavras (palavra, definicao, data) values (?, ?, ?)', [palavra, definicao, data])
      }
      else{
        await this.db.run('insert into palavras (palavra, data) values (?, ?)', [palavra, data])
      }
    }
    catch(err){
      let consistency = await this.databaseService.sqlite.checkConnectionsConsistency()

      this.erros.push('consistency: ' + JSON.stringify(consistency))
      this.erros.push(err)
    }

  }

  async buscarPalavras(): Promise<Array<any>>{
    try{
      if(this.db != undefined && this.db != null){
        let result = await this.db.query('select * from palavras order by id desc')
        return result.values
      }
    }
    catch(err){
      this.erros.push('erro ao buscar palavras: ' + err)
    }
  }

  async apagarPalavra(id: number){
    try{
      await this.db.run('delete from palavras where id = ?', [id])
    }
    catch(err){
      this.erros.push(err)
    }
  }

  async alterarPalavra(palavra: string, novaDefinicao: string){
    await this.db.run('update palavras set definicao = ? where palavra = ?', [novaDefinicao, palavra])
  }

  ngOnDestroy(){
    this.databaseService.closeConnection(database)
  }
}
