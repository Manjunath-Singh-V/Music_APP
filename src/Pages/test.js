import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
//import { AudioContext } from 'web-audio-api';
import './MusicApp.css'

const idb = 
    window.indexedDB ||
    window.mozIndexedDB ||
    window.webkitIndexedDB ||
    window.msIndexedDB ||
    window.shimIndexedDB;

const Test = () => {

  const [allMusicData , setAllMusicData] = useState([]);

  const [isPlaying, setIsPlaying] = useState(false);

  let [arrayBuffer, setArrayBuffer] = useState(null);

  const [PlayFile, setPlayFile] = useState(false);

  const [fileData, setFileData] = useState();

  const navigate = useNavigate();

  useEffect(() => {
    getAlldata();
  }, []);

  //console.log(allMusicData.audioblob)

  useEffect(() => {
    let audioContext;
    
    const playAudio = () => {
      audioContext = new AudioContext();
      
      audioContext.decodeAudioData(
        arrayBuffer,
        (buffer) => {
          const source = audioContext.createBufferSource();
          source.buffer = buffer;
          source.connect(audioContext.destination);
          source.onended = () => setIsPlaying(false);
          source.start();

          setIsPlaying(true);
        },
        (error) => {
          console.error('Error decoding audio data:', error);
        }
      );
    };

    const pauseAudio = () => {
      if (audioContext) {
        audioContext.suspend();
        setIsPlaying(false);
      }
    };

    if (isPlaying && arrayBuffer) {
      playAudio();
    } else {
      pauseAudio();
    }

    return () => {
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [arrayBuffer, isPlaying]);

  const getAlldata = () => {
    const dbPromise = idb.open("music-upload-data", 2) 

    dbPromise.onsuccess = () => {
        const db = dbPromise.result;

        const tx = db.transaction("PlayList", "readonly");

        const PlayList = tx.objectStore("PlayList");

        const play = PlayList.getAll();

        play.onsuccess = (query) => {
            setAllMusicData(query.srcElement.result);
            //setArrayBuffer(allMusicData.audioblob);
        }

        play.onerror = (query) => {
            console.log('Error in fetching data');
        }

        tx.oncomplete = () => {
            db.close();
        }
    }
  }

  const togglePlayPause = () => {
    setIsPlaying((prevIsPlaying) => !prevIsPlaying);
  };

  const PlayListPage = () => {
    navigate('../MusicApp');
  }

  const deleteFilePlayList = (file) => {
    const dbPromise = idb.open("music-upload-data", 2) 

    dbPromise.onsuccess = () => {
        const db = dbPromise.result;
        const trans = db.transaction("PlayList", "readwrite");
        const PlayListData = trans.objectStore("PlayList");
        const deletePlayData = PlayListData.delete(file?.id);
        deletePlayData.onsuccess = () => {
            alert('Music Deleted From PlayList!')
            getAlldata();
        }
        deletePlayData.onerror = (query) => {
            console.log('Error in deleting data data');
        }
        trans.oncomplete = () => {
            db.close();
        }
    }
  }

  return (
    <div className='row' style={{ padding: 100 }}>
      <em><strong>Playlist Page</strong></em>
      <div className='col-md-6'>
        <table className='table table-bordered'>
          <thead>
            <tr>
              <th>Song name</th>
              <th>Song size</th>
              <th>Song type</th>
              <th>Play Song</th>
              <th>Delete from PlayList</th>
            </tr>
          </thead>
          <tbody>
              { allMusicData?.map((row) => (
                <tr key={row?.id}>
                    <td>{row?.filename}</td>
                    <td>{Math.round(row?.filesize / Math.pow(10 ,6))}MB</td>
                    <td>{row?.filetype}</td>

                    <td><button className='btn btn-primary float-end mb-2'
                    onClick={() => {
                      setPlayFile(true)
                      setFileData(row)
                    }}
                    >Play</button></td>
                    <td>
                      <button className='btn btn-danger' onClick={() => {
                          deleteFilePlayList(row)
                      }}>Delete</button>
                    </td> 
                  </tr>
                ))
              }
          </tbody>
        </table>
        </div>
        <div className='col-md-6'>
            { PlayFile ?
              (<div className='card' style={{padding: '20px', marginLeft: '50px'}}>
                <h3>Audio Details</h3>
                <p>FileName: {fileData.filename}</p>
                <p>FileType: {fileData.filetype}</p>
                <p>FileSize: {(fileData.filesize / Math.pow(10 ,6))}MB</p>
                <p><button  className = 'btn btn-primary' onClick={() => {
                  togglePlayPause()
                  setArrayBuffer(fileData.audioblob)
                  //setFileData("")
                  //setArrayBuffer("")
                }}>{isPlaying ? 'Pause' : 'Play'}</button></p>
              </div>)
            : null}
        </div>
        <div className='col-md-6'>
            <button className='btn btn-primary float-end mb-2'  onClick={() => PlayListPage()}>Home Page</button>
        </div>
    </div>
  )
}

export default Test
