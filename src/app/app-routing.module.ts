import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { LoginComponent } from './login/login.component';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { SignupComponent } from './signup/signup.component';
import { AccountsComponent } from './accounts/accounts.component';
import { FilesComponent } from './files/files.component';
import { EmailVerificationComponent } from './email-verification/email-verification.component';
import { AuthGuardService } from './services/auth-guard.service';
import { MergedAccountComponent } from './merged-account/merged-account.component';

// routes array for components

const routes: Routes = [
  { path: '', component: LoginComponent, pathMatch: 'full' },
  { path: 'Signup', component: SignupComponent },
  { path: 'PasswordReset', component: ForgotPasswordComponent },
  { path: 'EmailVerification/:id', component: EmailVerificationComponent},
  {
    path: 'Dashboard', component: UserDashboardComponent, canActivate: [AuthGuardService]
    , children: [
      { path: '', component: MergedAccountComponent, pathMatch: 'full' },
      { path: 'Storage/:id', component: FilesComponent },
      { path: 'Accounts', component: AccountsComponent }
    ]
  },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
