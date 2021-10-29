import { AfterContentChecked, AfterContentInit, Component, OnInit, ViewChild } from '@angular/core';
import SwiperCore, { Navigation, Pagination, EffectCoverflow, SwiperOptions, Virtual } from 'swiper';
import { IonicSwiper } from '@ionic/angular';
import { SwiperComponent } from 'swiper/angular';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PalavraDaoService } from '../services/palavra-dao.service';

SwiperCore.use([IonicSwiper, Navigation, Pagination, EffectCoverflow, Virtual]);

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements AfterContentChecked, OnInit{

  config: SwiperOptions = {
    slidesPerView: 1,
    spaceBetween: 50,
    pagination: { clickable: true },
    scrollbar: { draggable: true },
    effect: 'coverflow'
  };

  palavraForm: FormGroup
  palavras: Array<any> = ['vazio']
  erros: Array<any> = []

  @ViewChild('swiper') swiper: SwiperComponent

  constructor(private formBuilder: FormBuilder, private palavraDao: PalavraDaoService) {
    this.palavraForm = this.formBuilder.group({
      palavra: [''],
      definicao: ['']
    })

    this.erros = this.palavraDao.erros

  }

  ngAfterContentChecked(){
    if(this.swiper){
      this.swiper.updateSwiper({})
    }
  }

  apagarPalavra(palavra){
    this.erros.push("Palavra recebida: " + JSON.stringify(palavra))
    this.palavraDao.apagarPalavra(Number(palavra.id))
      .then(() => {
          this.removerPalavraDoArray(palavra)
          if(this.swiper){
            this.swiper.updateSwiper({})
          }
        })
      .catch(erro => {
        this.erros.push('erro ao apagar palavra: ' + erro)
      })
  }
  
  private removerPalavraDoArray(palavra){
    this.palavras.splice(this.palavras.indexOf(palavra), 1)
  }


  onSwiper(swiper) {
    console.log(swiper);
  }
  onSlideChange() {
    console.log(JSON.stringify(this.palavras))
  }

  onSubmit(){
    let input = this.palavraForm.getRawValue()
    console.log('palavra: ' + JSON.stringify(input))
    this.palavraDao.inserirPalavra(input.palavra, input.definicao)
    .then(async () => {
      this.palavras = await this.palavraDao.buscarPalavras()
      this.swiper.swiperRef.slideNext(100)
      this.palavraForm.get('palavra').setValue('')
      this.palavraForm.get('definicao').setValue('')
    })
    .catch(erro => {
      this.erros.push('erro ao inserir palavra: ' + erro)
      console.log('erro ao inserir palavra: ' + erro)
    })
  }

  async ngOnInit() {
    await this.palavraDao.conectar()
    this.palavras = await this.palavraDao.buscarPalavras()
  }
 
}
