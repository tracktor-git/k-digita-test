/* eslint-disable jsx-a11y/alt-text */
import {
  CCard,
  CCardBody,
  CContainer,
  CLink,
  CPopover,
  CRow,
  CSmartTable,
  CSpinner,
  CButton,
  CModalFooter,
  CCardHeader,
} from '@coreui/react-pro'
import React, { createRef, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import DocumentsApi from './Documents.Api'
import { useParams } from 'react-router-dom'
import Modal from '../../components/Modal'
import Offcanvas from '../../components/Offcanvas'
import CIcon from '@coreui/icons-react'
import { cilArrowCircleLeft } from '@coreui/icons'
import { useTypedSelector } from '../../store'
import { Viewer, Worker, RenderPageProps } from '@react-pdf-viewer/core'
import { printOrDownloadDoc } from '../../utils'

import PrintDownloadControls from '../../components/PrintDownloadControls'

const CustomPageLayer: React.FC<{
  renderPageProps: RenderPageProps
}> = ({ renderPageProps }) => {
  React.useEffect(() => {
    // Mark the page rendered completely when the canvas layer is rendered completely
    // So the next page will be rendered
    if (renderPageProps.canvasLayerRendered) {
      renderPageProps.markRendered(renderPageProps.pageIndex)
    }
  }, [renderPageProps.canvasLayerRendered])

  return (
    <>
      {renderPageProps.canvasLayer.children}
      {renderPageProps.annotationLayer.children}
    </>
  )
}

const renderPdfPage = (props: RenderPageProps) => (
  <CustomPageLayer renderPageProps={props} />
)

const Document = (): JSX.Element => {
  const navigate = useNavigate()
  const [downloadFileName, setDownloadFileName] = useState('')
  const [listDocuments, setListDocuments] = useState<any[]>([])
  const [visible, setVisible] = useState(true)
  const [showPicture, setShowPicture] = useState<any>({})
  const [downloadDocument, setDownloadDocument] = useState('')
  const [downloadDocumentMimeType, setDownloadDocumentMimeType] = useState('')
  const [titleName, setTitleName] = useState('')
  const [dataFormat, setDataFormat] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const docName = searchParams.get('name')

  const getDocumentsShow = (id: any) => {
    DocumentsApi.getImageById(id).then((result: any) => {
      console.log(result)
      setShowPicture(result.data)
    })
  }

  useEffect(() => {
    getDocumentsShow(id)
  }, [id])

  const docRef = React.useRef(null)

  return (
    <CContainer>
      <CCard>
        <CCardHeader className="px-4">
          <div>{docName}</div>
        </CCardHeader>
        <CCardBody>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <p className="fs-1">{titleName}</p>
          </div>

          <div
            className="mt-2"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {showPicture?.file?.url ? (
              <>
                {showPicture?.file?.url.includes('.pdf') ? (
                  <div
                    className="pdf-viewer"
                    ref={docRef}
                    style={{
                      border: '1px solid rgba(0, 0, 0, 0.3)',
                      // height: '490px',
                      width: '100%',
                    }}
                  >
                    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.5.141/build/pdf.worker.min.js">
                      <Viewer
                        fileUrl={showPicture?.file?.url}
                        renderPage={renderPdfPage}
                        withCredentials={true}
                        onDocumentLoad={() => setIsLoading(false)}
                      />
                    </Worker>
                  </div>
                ) : (
                  <div>
                    <img
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                      }}
                      src={showPicture?.file?.url}
                    />
                  </div>
                )}
                {/* TRACKTOR'S CODE STARTS HERE */}
                <PrintDownloadControls
                  isDisabled={isLoading}
                  printElement={showPicture?.file?.url}
                />
                {/* TRACKTOR'S CODE ENDS HERE */}
              </>
            ) : (
              <></>
            )}
          </div>
        </CCardBody>
      </CCard>
    </CContainer>
  )
}

export default Document
