document.addEventListener("DOMContentLoaded", async () => {
    // Initialize the Variables
    let songIndex = 0;
    let audioElement = new Audio();
    let songs = [];
    let masterSongName = document.getElementById('masterSongName'); // Moved here to ensure DOM is loaded

    // Function to initialize player controls and event listeners
    function initializePlayerControls() {
        let masterPlay = document.getElementById('play');
        let myProgressBar = document.getElementById('myProgressBar');
        let volumeSlider = document.getElementById('volumeSlider');

        // Event listener for play/pause button
        masterPlay.addEventListener('click', () => {
            if (audioElement.paused) {
                audioElement.play();
                masterPlay.src = "img/pause.svg";
            } else {
                audioElement.pause();
                masterPlay.src = "img/play.svg";
            }
        });

        // Volume control functionality
        volumeSlider.addEventListener('input', () => {
            audioElement.volume = parseFloat(volumeSlider.value);
        });

        // Update seek bar as audio plays
        audioElement.addEventListener('timeupdate', () => {
            const progress = (audioElement.currentTime / audioElement.duration) * 100;
            myProgressBar.value = progress;
        });

        // Allow user to seek through the audio
        myProgressBar.addEventListener('input', () => {
            const seekTime = (myProgressBar.value / 100) * audioElement.duration;
            audioElement.currentTime = seekTime;
        });
    }



    // Fetch songs from JSON file and update the global songs array
    async function getSongs() {
        try {
            let response = await fetch('/songs/songs.json');
            let jsonSongs = await response.json();
            songs = jsonSongs; // Update the global songs array
        } catch (error) {
            console.error("Error fetching songs:", error);
        }
    }

    const playMusic = (index, pause = false) => {
        if (index < 0 || index >= songs.length) {
            console.error(`Invalid index ${index}.`);
            return;
        }

        const track = songs[index];
        if (!track) {
            console.error(`Track at index ${index} is undefined.`);
            return;
        }

        if (audioElement.src !== track.file) {
            audioElement.src = track.file;
            audioElement.volume = parseFloat(document.getElementById('volumeSlider').value); // Set initial volume
        }

        if (!pause) {
            audioElement.play()
                .then(() => {
                    masterSongName.innerHTML = `${track.title}`;
                    document.getElementById('play').src = "img/pause.svg";
                })
                .catch(error => {
                    console.error('Error playing audio:', error);
                });
        } else {
            audioElement.pause();
            document.getElementById('play').src = "img/play.svg";
        }
    };

    // Display all albums on the page
    async function displayAlbums() {
        console.log("Displaying albums");
        try {
            let response = await fetch('/songs/playlists.json'); // Assuming playlists.json contains album data
            let albums = await response.json();
            let cardContainer = document.querySelector(".cardContainer");

            for (let i = 0; i < albums.length; i++) {
                const album = albums[i];
                let card = document.createElement('div');
                card.classList.add('card');
                card.innerHTML = `<div class="play">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5" stroke-linejoin="round" />
                                    </svg>
                                </div>
                                <img src="${album.albumCover}" alt="">
                                <h2>${album.title}</h2>
                                <h3>${album.description}</h3>`;

                // Add event listener to each album card
                card.addEventListener('click', async () => {
                    try {
                        // Fetch songs for the selected album
                        let responseSongs = await fetch('/songs/songs.json');
                        let allSongs = await responseSongs.json();

                        // Filter songs belonging to the selected playlist
                        let playlistSongs = allSongs.filter(song => song.playlist === album.title);

                        // Update the global songs array with the playlist songs
                        songs = playlistSongs;

                        // Clear previous playlist content
                        let songUL = document.querySelector(".songList ul");
                        songUL.innerHTML = "";

                        // Show all the songs of the selected album in the playlist
                        for (const [index, song] of playlistSongs.entries()) {
                            let songItem = document.createElement('li');
                            songItem.innerHTML = `<img width="34" src="${song.songCover}" alt="">
                                                 <div class="info">
                                                     <div>${song.title}</div>
                                                     <div>${song.description}</div>
                                                 </div>
                                                 <div class="playnow">
                                                     <span>Play Now</span>
                                                     <img class="invert play-button" src="img/play.svg" alt="">
                                                 </div>`;
                            songItem.addEventListener("click", () => {
                                playMusic(index);
                            });
                            songUL.appendChild(songItem);
                        }

                    } catch (error) {
                        console.error("Error fetching album songs:", error);
                    }
                });

                cardContainer.appendChild(card);
            }

        } catch (error) {
            console.error("Error displaying albums:", error);
        }
    }

    // Update seek bar as audio plays
    audioElement.addEventListener('timeupdate', () => {
        const progress = (audioElement.currentTime / audioElement.duration) * 100;
        myProgressBar.value = progress;
    });

    // Allow user to seek through the audio
    myProgressBar.addEventListener('input', () => {
        const seekTime = (myProgressBar.value / 100) * audioElement.duration;
        audioElement.currentTime = seekTime;
    });

    // Initialize player controls after DOM content is loaded
    await getSongs();
    displayAlbums();
    initializePlayerControls(); // Call the function to initialize event listeners
});