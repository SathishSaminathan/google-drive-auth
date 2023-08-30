import { useState } from "react";
import { gapi } from "gapi-script";
import { GoogleDrive } from "./assets/icons";

const CLIENT_ID = import.meta.env.APP_GOOGLE_DRIVE_CLIENT_ID;
const API_KEY = import.meta.env.APP_GOOGLE_DRIVE_API_KEY;
const DISCOVERY_DOCS = [
  "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
];
const SCOPES = "https://www.googleapis.com/auth/drive.metadata.readonly";

function App() {
  const [isLoadingGoogleDriveApi, setIsLoadingGoogleDriveApi] = useState(false);
  const [signedInUser, setSignedInUser] = useState();
  const [isFetchingGoogleDriveFiles, setIsFetchingGoogleDriveFiles] =
    useState(false);
  const [listDocumentsVisible, setListDocumentsVisibility] = useState(false);
  const [documents, setDocuments] = useState([]);

  const handleAuthClick = () => {
    gapi.auth2.getAuthInstance().signIn();
  };

  console.log(
    signedInUser,
    isFetchingGoogleDriveFiles,
    listDocumentsVisible,
    documents
  );

  const listFiles = (searchTerm = null) => {
    setIsFetchingGoogleDriveFiles(true);
    gapi.client.drive.files
      .list({
        pageSize: 10,
        fields: "nextPageToken, files(id, name, mimeType, modifiedTime)",
        q: searchTerm,
      })
      .then(function (response: any) {
        setIsFetchingGoogleDriveFiles(false);
        setListDocumentsVisibility(true);
        const res = JSON.parse(response.body);
        setDocuments(res.files);
      });
  };

  const updateSigninStatus = (isSignedIn: boolean) => {
    if (isSignedIn) {
      setSignedInUser(gapi.auth2.getAuthInstance().currentUser.je.Qt);
      setIsLoadingGoogleDriveApi(false);
      listFiles();
    } else {
      handleAuthClick();
    }
  };

  const initClient = () => {
    setIsLoadingGoogleDriveApi(true);
    gapi.client
      .init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES,
      })
      .then(
        function () {
          // Listen for sign-in state changes.
          gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

          // Handle the initial sign-in state.
          updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        },
        function (error: any) {
          console.log(error);
        }
      );
  };

  const handleClick = () => {
    gapi.load("client:auth2", initClient);
  };

  return (
    <>
      <div className="bg-slate-200 h-screen flex items-center justify-center">
        {isLoadingGoogleDriveApi ? (
          <div>Google Api is loading...</div>
        ) : (
          <button
            onClick={() => handleClick()}
            className="flex items-center justify-center gap-10 bg-white p-10 hover:bg-slate-100 "
          >
            <GoogleDrive />
            <div>
              <h3 className="text-2xl font-semibold">Goole Drive</h3>
              <p>Import docs straight from your drive</p>
            </div>
          </button>
        )}
      </div>
    </>
  );
}

export default App;
