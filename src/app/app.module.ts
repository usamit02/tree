import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { TreeComponent } from './tree/tree.component';
import { HttpClientModule } from '@angular/common/http';
import { MysqlService } from './service/mysql.service';
import { TreeModule } from 'angular-tree-component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NavComponent } from './nav/nav.component';
import { LayoutModule } from '@angular/cdk/layout';
import { MatToolbarModule, MatButtonModule, MatSidenavModule, MatIconModule, MatListModule, MatGridListModule, MatCardModule, MatMenuModule, MatTableModule, MatPaginatorModule, MatSortModule } from '@angular/material';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TableComponent } from './table/table.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EditorModule } from '@tinymce/tinymce-angular';
import { HomeComponent } from './home/home.component';
import { MemberComponent } from './member/member.component';
import { TinyComponent } from './tiny/tiny.component';
import { SafePipe } from './safe.pipe';
import { Tiny2Component } from './tiny2/tiny2.component';
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from 'angularfire2/storage';
import { NoticeComponent } from './notice/notice.component';
import { CashComponent } from './cash/cash.component';
import { BookComponent } from './book/book.component';
import { StoryComponent } from './story/story.component';
import { firebaseConfig } from '../environments/environment';
@NgModule({
  declarations: [
    AppComponent,
    TreeComponent,
    NavComponent,
    DashboardComponent,
    TableComponent,
    HomeComponent,
    MemberComponent,
    TinyComponent,
    SafePipe,
    Tiny2Component,
    NoticeComponent,
    CashComponent,
    BookComponent,
    StoryComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    TreeModule.forRoot(),
    BrowserAnimationsModule,
    LayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatGridListModule,
    MatCardModule,
    MatMenuModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    FormsModule,
    ReactiveFormsModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireAuthModule,
    AngularFirestoreModule,
    AngularFireStorageModule,
    EditorModule,
  ],
  providers: [
    MysqlService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
