import { ToastController } from '@ionic/angular';
import { Injectable } from '@angular/core';

import { AngularFirestore } from '@angular/fire/compat/firestore';

import { Storage } from '@ionic/storage-angular';



interface User {
  name: string;

  userId: string;
  phone: string;
  email: string;
  purpose: string;
  status: string;
  visitor: string;
  department: string;
  id?: string;
}

interface Logs {
  userId: string;
  name: string;
  timeIn: string;
  timeOut: string;
  date: string;
  loggedIn: boolean
}


@Injectable({
  providedIn: 'root'
})
export class UserService {
  users: User[] = [];
  logs: Logs[] = [];

  currentUser: string = "";
  isUser = false;
  loginTime: string = ""


  dbKeys = {
    userid: 'userId',
    user: 'userDetails',
    logId: 'logId',
    isUser: 'isUser'
  }

  public subscriptions: any = 'user'

  private _storage: Storage | null = null;

  constructor(private toastCtrl: ToastController, private afs: AngularFirestore, private storage: Storage) {
    this.init();
  }



  getDate() {
    const day = new Date().getDay();
    const month = new Date().getMonth();
    const year = new Date().getFullYear();
    const date = `${month + 1}/${day}/${year}`;



    const min = new Date().getMinutes();
    const sec = new Date().getSeconds();
    const hour = new Date().getHours();

    const time = `${hour}:${min}:${sec}`;

    return [date, time]
  }

  localTimeFormat() {
    const mins = new Date().getMinutes();
    const ss = new Date().getSeconds();
    const h = new Date().getHours();
    const hour = Number(h);
    const min = Number(mins);
    const sec = Number(ss);

    if (hour > 12) {
      return `${hour - 12} : ${min} pm`;
    } else if (hour === 12) {
      return `${hour} : ${min} pm`;
    } else {
      return `${hour} : ${min} am`;
    }

  }



  getUser() {
    return this.getObject(this.dbKeys.user)
  }
  userStatus() {
    return this.getString('isUser')
  }
  loginStatus() {
    return this.getString('isLoggedin')
  }


  async presentToast(msg: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      mode: 'ios',
      duration: 2000,
      position: 'top',
      color: 'primary'
    });

    await toast.present();
  }




  async registerUser(user: User) {
    let users: any = [];
    let docRef = await this.afs.collection('users', ref => ref.where('phone', '==', user.phone)).snapshotChanges();
    this.subscriptions = docRef.subscribe(data => {
      if (data.length !== 0) {
        users = data.map(
          (document: any) =>
            ({
              // eslint-disable-next-line @typescript-eslint/ban-types
              ...(document.payload.doc.data() as {}),
              id: document.payload.doc.id,
            } as User)

        );
        users[0].purpose = user.purpose;
        users[0].status = user.status;

        this.setString(this.dbKeys.userid, users[0].id);
        this.setObject(this.dbKeys.user, users[0]);
        this.loginUser(user);
      } else {

        this.afs.collection('users').add(user).then(async function (doc: any) {

          this.setString(this.dbKeys.userid, doc.id);
          this.setObject(this.dbKeys.user, user);
          this.setString(this.dbKeys.isUser, 'true');
          this.loginUser(user);

        })

      }
    })

    // db.unsubscribe();  

  }


  async loginUser(user: User) {
    const log = {
      userId: user.userId,
      name: user.name,
      purpose: user.purpose,
      status: user.status,
      timeIn: this.getDate()[1],
      timeOut: null,
      date: this.getDate()[0],
      loggedIn: true,

    }

    const dbRef = await this.afs.collection('logs').add(log).then(async (docRef: any) => {

      this.setString('logId', docRef.id);
      this.setString('isUser', 'true');
      this.setString('isLoggedin', 'true');
      this.subscriptions.unsubscribe();

    });
  }



  async LogOutUser() {
    this.setString('isLoggedin', 'false');
    this.getString(this.dbKeys.logId).then(async user => {


      const dbRef = await this.afs.collection('logs').doc(user).update(
        {
          timeOut: this.getDate()[1],
          loggedIn: false
        }
      ).then(() => {
        this.presentToast('You are logged out, see you another time');

        this.setString('isLoggedin', 'false');
      })
    })

  }





  async init() {
    // If using, define drivers here: await this.storage.defineDriver(/*...*/);
    const storage = await this.storage.create();

    this._storage = storage;
  }


  public setString(key: string, value: any) {

    this._storage?.set(key, value);
  }

  public setObject(key: string, value: any) {
    this._storage?.set(key, JSON.stringify(value));
  }


  public async getString(key: string) {
    const user = await this.storage.get(key);

    return user
  }


  public async getObject(key: string) {
    const user = await this.storage.get(key);

    return user
  }


  public async removeUser() {
    await this.storage.remove('authKey');
  }


  async removeItem(key: string) {
    await this._storage.remove(key);
  }

  async clear() {
    await this._storage.clear();
  }


}
