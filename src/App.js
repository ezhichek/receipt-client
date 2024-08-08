import logo from './logo.svg';
import './App.css';
import {useEffect, useRef, useState} from "react";
import axios from "axios";

const STACK_ID = 'ap00ekbzlb'

const App = () => {

  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedModel, setSelectedModel] = useState('');
  const [receipts, setReceipts] = useState([]);
  const fileInputRef = useRef(null);
  const toastRef = useRef(null);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState(''); // success or error

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleSelectedModelChange = (event) => {
    setSelectedModel(event.target.value);
  };

  const handleLoadReceipts = (event) => {
    if (selectedModel) {
      axios.get(`https://${STACK_ID}.execute-api.eu-west-3.amazonaws.com/default/receipts?model=${selectedModel}`)
          .then(response => {
            setReceipts(response.data);
          })
          .catch(error => {
            console.error('Error fetching receipts:', error);
          });
    }
  }

  const handleUpload = (event) => {
    event.preventDefault();

    if (!selectedFile) {
      alert('Please select a file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    axios.post(`https://${STACK_ID}.execute-api.eu-west-3.amazonaws.com/default/receipts`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
        .then(response => {
          console.log('File uploaded successfully:', response.data);
          setToastMessage(`Datei ${selectedFile.name} wurde hochgeladen!`);
          setToastType('success');
          showToast();
          setSelectedFile(null)
          fileInputRef.current.value = null;
        })
        .catch(error => {
          console.error('Error uploading file:', error);
          setToastMessage(`Datei ${selectedFile.name} konnte nicht hochgeladen werden!`);
          setToastType('error');
          showToast();
        });
  };

  const showToast = () => {
    const toastEl = toastRef.current;
    const toast = new window.bootstrap.Toast(toastEl);
    toast.show();
  };

  return (
      <div className="container mt-4">

        <div className="row mb-3">
          <div className="col-md-4">
            <div className="input-group">
              <select className="form-select" id="dropdownMenu" aria-label="Dropdown menu" value={selectedModel}
                      onChange={handleSelectedModelChange}
                      value={selectedModel}>
                <option value="">Modell auswählen</option>
                <option value="claude-3-sonnet-textract">claude-3-sonnet-textract</option>
                <option value="claude-3-sonnet-vanilla">claude-3-sonnet-vanilla</option>
                <option value="mistral-large-2402-textract">mistral-large-2402-textract</option>
                <option value="llama3-70b-instruct-textract">llama3-70b-instruct-textract</option>
                <option value="titan-text-premier-textract">titan-text-premier-textract</option>
              </select>
            </div>
          </div>
          <div className="col-md-2">
            <button className="btn btn-primary" disabled={!selectedModel} onClick={handleLoadReceipts}>Belege anzeigen
            </button>
          </div>
          <div className="col-md-4">
            <div className="input-group">
              <input
                  className="form-control"
                  type="file"
                  id="fileUpload"
                  onChange={handleFileChange}
                  ref={fileInputRef}
              />
            </div>
          </div>
          <div className="col-md-2">
            <button className="btn btn-primary" onClick={handleUpload} disabled={!selectedFile}>Beleg hinzufügen
            </button>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <table className="table table-striped">
              <thead>
              <tr>
                <th scope="col" className="text-start">Datei</th>
                <th scope="col" className="text-start">Händler</th>
                <th scope="col" className="text-start">Rechnungs-Nr.</th>
                <th scope="col" className="text-center">Datum</th>
                <th scope="col" className="text-center">Währung</th>
                <th scope="col" className="text-end">Summe</th>
                <th scope="col" className="text-end">Mwst.</th>
              </tr>
              </thead>
              <tbody>
              {receipts.map(receipt =>
                  <tr key={receipt.file_name}>
                    <td className="text-start">{receipt.file_name}</td>
                    <td className="text-start">{receipt.merchant}</td>
                    <td className="text-start">{receipt.invoice_number}</td>
                    <td className="text-center">{receipt.date}</td>
                    <td className="text-center">{receipt.currency}</td>
                    <td className="text-end">{receipt.total_amount}</td>
                    <td className="text-end">{receipt.vat_amount}</td>
                  </tr>
              )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="position-fixed bottom-0 end-0 p-3" style={{zIndex: 11}}>
          <div className={`toast align-items-center text-bg-${toastType === 'success' ? 'success' : 'danger'} border-0`}
               ref={toastRef} role="alert" aria-live="assertive" aria-atomic="true">
            <div className="d-flex">
              <div className="toast-body">
                {toastMessage}
              </div>
              <button type="button" className="btn-close me-2 m-auto" data-bs-dismiss="toast"
                      aria-label="Close"></button>
            </div>
          </div>
        </div>
      </div>
  );
}

export default App;
