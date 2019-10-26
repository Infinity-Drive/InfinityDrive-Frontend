export function standarizeFiles (files, accountType, accountId, showSplitParts = false) {

    var standarizedFiles = [];

    if (accountType === 'gdrive') {

      files.forEach(file => {
        if ((!showSplitParts && !file.name.includes('.infinitydrive.part')) || showSplitParts) {
          if (file.mimeType === 'application/vnd.google-apps.folder')
            file['mimeType'] = 'folder';

          file['accountType'] = 'gdrive';
          file['account'] = 'Google Drive';
          file['accountId'] = accountId;
          file['size'] = parseInt(file.size);
          standarizedFiles.push(file);
        }
      });

    }

    if (accountType === 'odrive') {

      files.forEach(file => {
        if ((!showSplitParts && !file.name.includes('.infinitydrive.part')) || showSplitParts) {
          // item has a file property if its a file and a folder property if its a folder
          file.file ? file['mimeType'] = file.file.mimeType : file['mimeType'] = 'folder';
          file.lastModifiedDateTime ? file['modifiedTime'] = file.lastModifiedDateTime : file['modifiedTime'] = '-';
          file['accountType'] = 'odrive';
          file['account'] = 'OneDrive';
          file['accountId'] = accountId;
          standarizedFiles.push(file);
        }

      });

    }

    if (accountType === 'merged') {
      files.forEach(file => {
        file['id'] = file._id;
        file['accountType'] = 'merged';
        file['account'] = 'Merged';
        standarizedFiles.push(file);
      });
    }

    if (accountType === 'dropbox') {

      files.entries.forEach(file => {
        if ((!showSplitParts && !file.name.includes('.infinitydrive.part')) || showSplitParts) {
          if (file['.tag'] === 'folder')
            file['mimeType'] = 'folder';
          else
            file['mimeType'] = file.name.split('.')[1];

          if (!file['client_modified'])
            file['client_modified'] = '-';

          standarizedFiles.push({
            id: file.id,
            name: file.name,
            mimeType: file['mimeType'],
            size: file.size,
            modifiedTime: file['client_modified'],
            accountType: 'dropbox',
            account: 'Dropbox',
            accountId: accountId
          });
        }
      });

    }
    return standarizedFiles;
  };