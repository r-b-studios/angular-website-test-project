import { Injectable } from '@angular/core';
import { AddsService } from '../adds/adds.service';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  constructor(public auth: AuthService, public a: AddsService) { }


}