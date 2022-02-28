

import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UserService } from './../user.service';
import { Router } from '@angular/router';
import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';

import { ToastController, Platform } from '@ionic/angular';


import { Network } from '@capacitor/network';



interface User {
  firstname: string;
  middlename: string;
  lastname: string;
  userId: string;
  phone: string;
  whatsapp: string;
  email: string;
  purpose: string;
  status: string;
  visitor: string;
}


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, AfterViewInit, OnDestroy {



  selectedSlide: any;
  segment = 0;


  sliderOptions = {
    initialSlide: 0,
    slidesPerView: 1,
    speed: 300,
  };

  formPage = false;
  loggedIn = false;
  isUser = false;
  clockedIn = 'You\'re clocked in';
  message = 'Clock out on your way out!';
  persona = '';
  loginTime = '';
  timer: any = '';
  hoursSpent = 0;
  minsSpent = 0;
  timeIn = "";
  loginTimer: any = false;




  userForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    phone: new FormControl('', [Validators.required, Validators.minLength(9)]),
    email: new FormControl('', []),
    purpose: new FormControl('', [Validators.required]),
    status: new FormControl(''),
    userId: new FormControl(''),
    visitor: new FormControl(''),
    department: new FormControl('')
  });

  activateOptions = false;
  activatestatus = false;

  purpose: any = [
    {
      title: 'Visit',
      id: 1,
      active: false
    },
    {
      title: 'Work',
      id: 2,
      active: false
    },

    {
      title: 'Project Work',
      id: 3,
      active: false,
    },
    {
      title: 'Official',
      id: 4,
      active: false
    },
    {
      title: 'Meeting',
      id: 5,
      active: false
    },


  ];



  function: any = [
    {
      title: 'Visit',
      id: 1,
      active: false
    },
    {
      title: 'Work',
      id: 2,
      active: false
    },
  ];

  status: any = [
    {
      title: 'Student',
      id: 1,
      active: false
    },
    {
      title: 'Lecturer',
      id: 2,
      active: false
    },

    {
      title: 'Engineer',
      id: 3,
      active: false,
    },
    {
      title: 'Doctor',
      id: 4,
      active: false
    },
    {
      title: 'Miner',
      id: 5,
      active: false
    },


  ];

  personaOptions: any = [];

  constructor( private router: Router, private userService: UserService,
    private toastCtrl: ToastController, private platform: Platform) { }

  ngOnInit() {



    this.userService.userStatus().then(async user => {
      this.isUser = user == 'true' ? true : false;
      if (this.isUser) {
        //this.presentToast('Scan to login');
        // this.login()
      }
    });

    this.userService.getUser().then(async user => {

      this.userForm.patchValue(JSON.parse(user));
    })
    this.loginTime = '0 min';

    this.componentDidLoad();


    Network.addListener('networkStatusChange', status => {

    });


  }

  ngOnDestroy() {
    Network.removeAllListeners()
  }

  ngAfterViewInit() {
    this.userService.loginStatus().then(async user => {

      if (user == 'true') {

        this.userService.getString('timeIn').then(async time => {
          this.timeIn = time;
          const ltime = this.timeIn.split(' ');

          let min = Number(ltime[2]);
          let hour = Number(ltime[0]);


          let ctime: any = this.userService.localTimeFormat();
          ctime = ctime.split(' ');

          let cmin = Number(ctime[2]);
          let chour = Number(ctime[0]);
          this.hoursSpent = Math.abs(chour - hour);
          this.minsSpent = Math.abs(cmin - min);

          this.startTimer(Math.abs(chour - hour), Math.abs(cmin - min));
        });



        this.loginTimer = window.setInterval(() => {

          this.loggedIn = true;
          this.formPage = false
          this.segmentChange(2);

        }, 100)
      }
    })
  }

  async componentDidLoad() {
    
  }



  purposeSelection(id: number, title: string) {
    this.purpose.forEach(p => {
      if (p.id === id) {
        p.active = true;
        this.userForm.patchValue({ purpose: title });
      } else {
        p.active = false;
      }
    });
  }


  statusSelection(id: number, title: string) {
    this.personaOptions.forEach(p => {
      if (p.id === id) {
        p.active = true;
        this.userForm.patchValue({ status: title });
      } else {
        p.active = false;
      }
    });
  }



  async login() {

    const status = await Network.getStatus();




    if (this.userForm.valid) {
      if (status.connected) {
        this.scanCode();
      } else {
        this.presentToast('Please turn on your data or Connect to a wifi to log in', 6000, 'wifi');
      }

    } else {
      this.presentToast('Validation failed, please make sure all fields are accuratly filled', 3000, 'key');
    }
  }

  async logOut() {
    const status = await Network.getStatus();
    if (status.connected) {



      this.loggedIn = false;
      this.userService.LogOutUser();
      this.segmentChange(0);
      window.clearInterval(this.timer);
      this.loginTime = '0 min';
      this.timeIn = ''
      this.minsSpent = 0;
      this.hoursSpent = 0;
      window.clearInterval(this.loginTimer);
      this.userService.removeItem('timeIn');






    } else {
      this.presentToast('Please turn on your data or Connect to a wifi to log out', 6000, 'wifi');
    }
  }

  toLoginSlide(persona: string) {


    this.persona = persona;
    this.userForm.patchValue({ userId: 'user-'.concat(String(1 + Math.random() * 100000)), visitor: persona, department: 'Uhub' });
    persona !== 'Staff' ? this.personaOptions = this.status : this.personaOptions = this.function;
    this.formPage = true;
    this.segmentChange(1);



  }
  toScanSlide() {

  }

  toLogOutSlide() {

  }
  toHomeSlide() {
    this.formPage = false;
    this.segmentChange(0);
  }


  scanCode() {

    this.userService.registerUser(this.userForm.value)
    this.loggedIn = true;
    this.formPage = false
    this.segmentChange(2);
    this.timeIn = this.userService.localTimeFormat();
    this.userService.setString('timeIn', this.timeIn)
    this.startTimer();
    this.presentToast('Login Succesfull, you are welcomed', 3000, 'key')


  }


  startTimer(h: number = 0, m: number = 0) {

    this.minsSpent = m;
    this.hoursSpent = h;
    if (this.loggedIn) {


      if (this.hoursSpent >= 1) {
        // eslint-disable-next-line max-len
        this.loginTime = `${this.hoursSpent} ${this.hoursSpent > 1 ? 'hrs' : 'hr'} ${this.minsSpent} ${this.minsSpent > 1 ? 'mins' : 'min'} `;

      } else {
        this.loginTime = `${this.minsSpent} ${this.minsSpent > 1 ? 'mins' : 'min'} `;
      }
    }

    this.timer = window.setInterval(() => {
      if (this.loggedIn) {
        this.minsSpent += 1;
        if (this.minsSpent > 60) {
          this.hoursSpent += 1;
        }
        if (this.hoursSpent >= 1) {
          // eslint-disable-next-line max-len
          this.loginTime = `${this.hoursSpent} ${this.hoursSpent > 1 ? 'hrs' : 'hr'} ${this.minsSpent} ${this.minsSpent > 1 ? 'mins' : 'min'} `;
        } else {
          this.loginTime = `${this.minsSpent} ${this.minsSpent > 1 ? 'mins' : 'min'} `;
        }
      }

    }, 60000);
  }

  slideChanged(slides) {
    slides.getActiveIndex().then((selectedIndex) => {
      this.segment = selectedIndex;
      this.selectedSlide = slides;
      if (selectedIndex !== 1) {
        this.formPage = false;
      }
    });
  }

  async segmentChange(slide: number) {
    await this.selectedSlide.slideTo(slide);

  }

  async presentToast(msg: string, dur, ic) {
    const toast = await this.toastCtrl.create({
      message: msg,
      mode: 'ios',
      duration: dur,
      position: 'top',
      color: 'primary',

    });

    await toast.present();
  }



}
