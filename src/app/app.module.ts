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
import { SidebarComponent } from './secure/sidebar/sidebar.component';

import { UserService } from './services/user.service';
import { AccountService } from './services/account.service';
import { AuthGuardService } from './services/auth-guard.service';


import { AccountReportComponent } from './public/account-report/account-report.component';
import { SettingsComponent } from './secure/settings/settings.component';
import { ResetPasswordComponent } from './public/reset-password/reset-password.component';
import { LandingComponent } from './public/landing-page/landing.component';
import { PrivacyPolicyComponent } from './public/privacy-policy/privacy-policy.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { StoreModule } from '@ngrx/store';

import { environment } from '../environments/environment';

import { accountReducer } from './reducers/account.reducer';
import { fileReducer } from './reducers/file.reducer';

import { FileSizePipe } from './shared/pipes/file-size.pipe';

import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatListModule } from '@angular/material/list';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatRippleModule } from '@angular/material/core';

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
    FileSizePipe,
    SidebarComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    StoreModule.forRoot({
      account: accountReducer,
      file: fileReducer
    }),
    MatInputModule,
    MatFormFieldModule,
    MatListModule,
    MatRadioModule,
    MatButtonToggleModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    DragDropModule,
    MatTabsModule,
    MatDialogModule,
    MatTableModule,
    MatSortModule,
    MatMenuModule,
    MatSelectModule,
    MatSliderModule,
    MatCheckboxModule,
    MatCardModule,
    MatPaginatorModule,
    MatExpansionModule,
    MatSidenavModule,
    MatRippleModule,
  ],
  providers: [UserService, AccountService, AuthGuardService],
  bootstrap: [AppComponent]
})
export class AppModule { }
