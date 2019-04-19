import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { AccountsComponent } from './accounts/accounts.component';
import { FilesComponent } from './files/files.component';
import { MergedAccountComponent } from './merged-account/merged-account.component';
import { SpinnerComponent } from './spinner/spinner.component';
import { EmailVerificationComponent } from './email-verification/email-verification.component';
import { SharedFileComponent } from './shared-file/shared-file.component';
import { UserSharedFilesComponent } from './user-shared-files/user-shared-files.component';

import { UserService } from './services/user.service';
import { AccountService } from './services/account.service';
import { AuthGuardService } from './services/auth-guard.service';


import { ChartsModule } from 'ng2-charts';
import { NgbPaginationModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { AccountReportComponent } from './account-report/account-report.component';

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
    UserSharedFilesComponent,
    AccountReportComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ChartsModule,
    NgbTooltipModule,
    NgbPaginationModule
  ],
  providers: [UserService, AccountService, AuthGuardService],
  bootstrap: [AppComponent]
})
export class AppModule { }
