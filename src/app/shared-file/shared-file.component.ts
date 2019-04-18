import {Component, OnInit} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import {ActivatedRoute} from '@angular/router';
import {UserService} from '../services/user.service';
import {AccountService} from '../services/account.service';

import * as streamSaver from 'streamsaver';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-shared-file',
  templateUrl: './shared-file.component.html',
  styleUrls: ['./shared-file.component.css']
})
export class SharedFileComponent implements OnInit {

  loading = true;
  file = undefined;

  constructor(private activatedRoute: ActivatedRoute, private user: UserService, private account: AccountService) {
  }

  ngOnInit() {

    this.activatedRoute.params.subscribe((params) => {
      this.user.getSharedFile(params.id).subscribe((file) => {
        this.loading = false;
        console.log(file);
        this.file = file;
      }, (err: HttpErrorResponse) => {
        console.log(err.error);
        this.loading = false;
      });
    });

  }


  getDownloadLink(accountId, id, accountType, shareId) {
    this.account.getDownloadUrlShared(accountId, id, accountType, shareId).subscribe((url: string) => {
      window.open(url['downloadUrl'], '_blank');
    }, (err: HttpErrorResponse) => {
      const errorMessage = err.error ? err.error : 'Error downloading file';
      Swal.fire('Error', errorMessage, 'error');
      console.log(err);
    });
  }

  getDownloadStream(id, accountType, name, size, shareId) {
    this.account.downloadStreamShare(id, accountType , shareId).then(res => {

      const fileStream = streamSaver.createWriteStream(name, size);
      const writer = fileStream.getWriter();

      // more optimized
      if (res.body.pipeTo) {
        // like as we never did fileStream.getWriter()
        writer.releaseLock();
        return res.body.pipeTo(fileStream);
      }

      const reader = res.body.getReader();
      const pump = () => reader.read()
        .then(({value, done}) => done
          // close the stream so we stop writing
          ? writer.close()
          // Write one chunk, then get the next one
          : writer.write(value).then(pump)
        );

      // Start the reader
      pump().then(() =>
        console.log('Closed the stream, Done writing')
      );
    }, (err: HttpErrorResponse) => {
      const errorMessage = err.error ? err.error : 'Error downloading file';
      Swal.fire('Error', errorMessage, 'error');
      console.log(err);
    });
  }

  getSizeInMb(size) {
    if (isNaN(size))
      return '-';
    else
      return (Number(size) / Math.pow(1024, 2)).toFixed(2) + ' MB';
  }

}
