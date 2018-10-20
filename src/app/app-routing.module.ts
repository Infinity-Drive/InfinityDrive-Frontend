import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { LoginComponent } from './login/login.component';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { SignupComponent } from './signup/signup.component';
import { AccountsComponent } from './accounts/accounts.component';
import { FilesComponent } from './files/files.component';

const routes: Routes = [
  {path : '', component : LoginComponent, pathMatch : 'full'},
  {path : 'Signup', component : SignupComponent},
  {path : 'PasswordReset', component : ForgotPasswordComponent},
  {path : 'Dashboard', component : UserDashboardComponent
    , children :  [
      {path : '' , component : AccountsComponent , pathMatch : 'full'},
      { path : 'Storage' , component : FilesComponent }
                  ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
