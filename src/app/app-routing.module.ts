import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {ForgotPasswordComponent} from './public/forgot-password/forgot-password.component';
import {LoginComponent} from './public/login/login.component';
import {UserDashboardComponent} from './secure/dashboard/dashboard.component';
import {SignupComponent} from './public/signup/signup.component';
import {AccountsComponent} from './secure/accounts/accounts.component';
import {FilesComponent} from './secure/files/files.component';
import {EmailVerificationComponent} from './public/email-verification/email-verification.component';
import {AuthGuardService} from './services/auth-guard.service';
import {MergedAccountComponent} from './secure/merged-account/merged-account.component';
import {SharedFileComponent} from './public/shared-file/shared-file.component';
import { SharedFilesComponent } from './secure/shared-files/shared-files.component';
import { AccountReportComponent } from './public/account-report/account-report.component';
import { SettingsComponent } from './secure/settings/settings.component';
import { ResetPasswordComponent } from './public/reset-password/reset-password.component';
import { LandingComponent } from './public/landing-page/landing.component';
import {PrivacyPolicyComponent} from './public/privacy-policy/privacy-policy.component';

// routes array for components

const routes: Routes = [
  {path: '', component: LandingComponent, pathMatch: 'full'},
  {path: 'Login', component: LoginComponent},
  {path: 'Signup', component: SignupComponent},
  {path: 'ForgotPassword', component: ForgotPasswordComponent},
  {path: 'ResetPassword/:id', component: ResetPasswordComponent},
  {path: 'EmailVerification/:id', component: EmailVerificationComponent},
  {path: 'AccountReport/:id', component: AccountReportComponent},
  {path: 'Shared/:id', component: SharedFileComponent},
  {path: 'Privacy-Policy', component: PrivacyPolicyComponent},
  {
    path: 'Dashboard', component: UserDashboardComponent, canActivate: [AuthGuardService]
    , children: [
      {path: '', component: MergedAccountComponent, pathMatch: 'full'},
      {path: 'Storage/:id', component: FilesComponent},
      {path: 'Accounts', component: AccountsComponent},
      {path: 'SharedFiles', component: SharedFilesComponent},
      {path: 'Settings', component: SettingsComponent},
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
