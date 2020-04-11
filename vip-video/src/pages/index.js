// import React from "react"
// import { Link } from "gatsby"
//
// import Layout from "../components/layout"
// import Image from "../components/image"
// import SEO from "../components/seo"
//
// const IndexPage = () => (
//   <Layout>
//     <SEO title="Home" />
//     <h1>Hi people</h1>
//     <p>Welcome to your new Gatsby site.</p>
//     <p>Now go build something great.</p>
//     <div style={{ maxWidth: `300px`, marginBottom: `1.45rem` }}>
//       <Image />
//     </div>
//     <Link to="/page-2/">Go to page 2</Link>
//   </Layout>
// )
//
// export default IndexPage
import React, { useEffect, useRef, useState } from "react"
import TwilioVideo from "twilio-video"

import Layout from "../components/layout"
import SEO from "../components/seo"
import StartForm from "../components/start-form"

const config = require('../server/config');


const { chatToken, videoToken } = require('../server/tokens');

const Video = ({ token }) => {
  const localVidRef = useRef()
  const remoteVidRef = useRef()

  useEffect(() => {
    TwilioVideo.connect(token, { video: true, audio: true, name: "test" }).then(
      room => {
        // Attach the local video
        console.log(token)
        var jwt = require('jsonwebtoken');
        var decoded = jwt.decode(token);
        var identity = decoded.grants.identity;
        console.log(identity);
        console.log("local name: ", identity)
        console.log("identity.includes('secondary_guest') = ", identity.includes('secondary_guest'))
        if (!identity.includes('secondary_guest')){
            TwilioVideo.createLocalVideoTrack().then(track => {
              localVidRef.current.appendChild(track.attach())
            })
        }

        const addParticipant = participant => {
          console.log("new remote participant!")
          console.log("remote name: ", participant.identity)
          console.log("participant.identity.includes('secondary_guest') = ", participant.identity.includes('secondary_guest'))
          if (participant.identity.includes('secondary_guest')){console.log("shouldn't show video")}
          if (!participant.identity.includes('secondary_guest')){console.log("this is not a secondary guest")
              participant.tracks.forEach(publication => {
                if (publication.isSubscribed) {
                  const track = publication.track

                  remoteVidRef.current.appendChild(track.attach())
                  console.log("attached to remote video")
                }
              })

              participant.on("trackSubscribed", track => {
                console.log("track subscribed")
                remoteVidRef.current.appendChild(track.attach())
              })
            }
        }

        room.participants.forEach(addParticipant)
        room.on("participantConnected", addParticipant)
      }
    )
  }, [token])

  return (
    <div>
      <p>Local video: </p><div ref={localVidRef} />
      <p>Remote video: </p><div ref={remoteVidRef} />
    </div>
  )
}

const IndexPage = () => {
  const [token, setToken] = useState(false)
  return (
    <Layout>
      <SEO title="Home" />
      {!token ? <StartForm storeToken={setToken} /> : <Video token={token} />}
      <p>
        TODO: 1. Show local video 2. Connect to a room 3. Show participants’
        video (remote) 4. Handle events
      </p>
    </Layout>
  )
}

export default IndexPage
