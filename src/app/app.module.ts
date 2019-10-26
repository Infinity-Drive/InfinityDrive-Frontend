import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { LoginComponent } from './public/login/login.component';
import { SignupComponent } from './public/signup/signup.component';
import { ForgotPasswordComponent } from './public/forgot-password/forgot-password.component';
import { UserDashboardComponent } from './secure/dashboard/dashboard.component';
import { AccountsComponent } from './secure/accounts/accounts.component';
import { FilesComponent } from './secure/files/files.component';
import { MergedAccountComponent } from './secure/merged-account/merged-account.component';
import { SpinnerComponent } from './shared/spinner/spinner.component';
import { EmailVerificationComponent } from './public/email-verification/email-verification.component';
import { SharedFileComponent } from './public/shared-file/shared-file.component';
import { SharedFilesComponent } from './secure/shared-files/shared-files.component';

import { UserService } from './services/user.service';
import { AccountService } from './services/account.service';
import { AuthGuardService } from './services/auth-guard.service';


import { ChartsModule } from 'ng2-charts';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { AccountReportComponent } from './public/account-report/account-report.component';
import { NgbPaginationModule, NgbTooltipModule, NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { SettingsComponent } from './secure/settings/settings.component';
import { ResetPasswordComponent } from './public/reset-password/reset-password.component';
import { LandingComponent } from './public/landing-page/landing.component';
import { PrivacyPolicyComponent } from './public/privacy-policy/privacy-policy.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { StoreModule } from '@ngrx/store';

import { environment } from '../environments/environment';

import { accountReducer } from './reducers/account.reducer';
import { FileSizePipe } from './shared/pipes/file-size.pipe';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignupComponent,
    ForgotPasswordComponent,
    UserDashboardComponent,
    AccountsComponent,
    FilesComponent,
    SpinnerComponent,
    MergedAccountComponent,
    EmailVerificationComponent,
    SharedFileComponent,
    SharedFilesComponent,
    AccountReportComponent,
    SettingsComponent,
    ResetPasswordComponent,
    LandingComponent,
    PrivacyPolicyComponent,
    FileSizePipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ChartsModule,
    NgbTooltipModule,
    NgbPaginationModule,
    NgbCollapseModule,
    NgxChartsModule,
    BrowserAnimationsModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    StoreModule.forRoot({
      account: accountReducer
    })
  ],
  providers: [UserService, AccountService, AuthGuardService],
  bootstrap: [AppComponent]
})
export class AppModule { }
