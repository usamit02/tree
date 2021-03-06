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
import { HomeComponent } from './home/home.component';
import { MemberComponent } from './member/member.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { TinyComponent } from './tiny/tiny.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SafePipe } from './safe.pipe';
import { Tiny2Component } from './tiny2/tiny2.component';
import { EditorModule } from '@tinymce/tinymce-angular';
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
    Tiny2Component
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
    CKEditorModule,
    FlexLayoutModule,
    EditorModule
  ],
  providers: [
    MysqlService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
