This is a React JS Project In which the user can do multiple functionalities.

1. User can Upload audio file from his/her device.
2. User can edit/delete the uploaded file from the Music-App.
3. User cannot add duplicate audio file to the app or the PlayList.
4. User can add the Music-data present in the indexeddb to the playList Page
5. User can play or pause the audio in the PlayList.
6. User can only add the audio file present in Music-App to the playList.
7. User can delete the audio file present in PlayList.

Details about the DataBase.

1. This project is built using the browser storage API which is the indexedDB.
2. The indexedDB contains 3 schemas which are (MusicUploadData, Temp and PlayList) with the fields/ attributes
3. The attributes in all the schemas are(id, audioblob, filename, filesize, filetype)
4. MusicUploadData is the schema in which uploaded audio data is stored from the local system.
5. Temp schema is used to store the uploaded data tp MusicUploadData.
6. PlayList schema is used to store the PlayList audio added from MusicUploadData schema.

The Sample images of the Project is stored in 'Music-Player/music-app/src/Project Images'



# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.
