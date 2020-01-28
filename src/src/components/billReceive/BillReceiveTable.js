import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import Fab from '@material-ui/core/Fab';
import Icon from '@material-ui/core/Icon';
import TouchApp from '@material-ui/icons/TouchApp';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import {
  getDateToString,
  getNumberDecimalToStringCurrency,
  getNumberToString,
} from '../../utils/operators';

import BillReceiveCreateModal from './BillReceiveCreateModal';
import BillReceiveEditModal from './BillReceiveEditModal';

import { printBillsReceiveis } from '../../services/printService';

import billsReceiveservice from '../../services/billsReceiveService';
import { getErrosFromApi } from '../../utils/errorsHelper';
import clientService from '../../services/clientService';

import TablePaginationActions from '../common/TablePaginationActions';
import Confirm from '../common/ConfirmAlert';

import PrintContainer from '../common/PrintContainer';
import { Typography } from '@material-ui/core';

const styles = theme => ({
  container: {
    //marginTop: theme.spacing(3),
    display: 'block',
    maxWidth: '98.5%',
    height: `calc(100vh - ${theme.spacing(22)}px)`,
    overflowY: 'scroll',
    overflowX: 'hidden',
  },
  back: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: 'column',
    padding: theme.spacing(2),
    borderColor: '#C0C0C0',
    borderStyle: 'solid',
    borderWidth: '1px',
    width: '98%',
  },
  table: {
    minWidth: 500,
  },
  openRow: {
    backgroundColor: theme.palette.secondary.light,
  },
  fab: {
    marginRight: theme.spacing(0.5),
    color: theme.palette.common.white,
  },
  fabEdit: {
    backgroundColor: theme.palette.edit.main,
    '&:hover': {
      backgroundColor: theme.palette.edit.dark,
    },
  },
  button: {
    margin: theme.spacing(1),
  },
  cellValue: {
    minWidth: '100px',
  },
  cellActions: {
    minWidth: '200px',
  },
  '@global': {
    'tr > td': {
      fontWeight: '600 !important',
      fontSize: '1.1em !important',
    },
  },
  flexContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  ellipses: {
    width: '100px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});

const stylesMenu = theme => ({
  iconPadding: {
    paddingRight: theme.spacing(1),
  },
});

function _MenuAcoes(props) {
  const {
    handleCloseMenuAcoes,
    anchorElMenuAcoes,
    handlePrintBillReceiveGroupByCode,
    handlePrintBillReceive,
    handlePrintBillReceivesOpen,
    handleEditBillReceive,
    handleDeleteBillReceive,
    billReceiveKey,
    situation,
    classes,
  } = props;
  return (
    <Menu
      id="simple-menu"
      anchorEl={anchorElMenuAcoes}
      open={Boolean(anchorElMenuAcoes)}
      onClose={handleCloseMenuAcoes}
    >
      {situation === 0 && (
        <MenuItem
          onClick={() => {
            handleEditBillReceive(billReceiveKey);
            handleCloseMenuAcoes();
          }}
        >
          <Icon className={classes.iconPadding}>attach_money</Icon>
          Baixar parcela
        </MenuItem>
      )}
      <MenuItem
        onClick={() => {
          handlePrintBillReceiveGroupByCode(billReceiveKey);
          handleCloseMenuAcoes();
        }}
      >
        <Icon className={classes.iconPadding}>print</Icon>
        Imprimir carnê
      </MenuItem>
      <MenuItem
        onClick={() => {
          handlePrintBillReceive(billReceiveKey);
          handleCloseMenuAcoes();
        }}
      >
        <Icon className={classes.iconPadding}>print </Icon>
        Imprimir parcela
      </MenuItem>
      <MenuItem
        onClick={() => {
          handlePrintBillReceivesOpen();
          handleCloseMenuAcoes();
        }}
      >
        <Icon className={classes.iconPadding}>print</Icon>
        Imprimir parcelas em aberto
      </MenuItem>
      <MenuItem
        onClick={() => {
          handleDeleteBillReceive(billReceiveKey);
          handleCloseMenuAcoes();
        }}
      >
        <Icon className={classes.iconPadding}>delete_forever</Icon>
        Excluir carnê
      </MenuItem>
    </Menu>
  );
}

_MenuAcoes.propTypes = {
  classes: PropTypes.object.isRequired,
  handleCloseMenuAcoes: PropTypes.func.isRequired,
  anchorElMenuAcoes: PropTypes.object.isRequired,
  handlePrintBillReceiveGroupByCode: PropTypes.func.isRequired,
  handlePrintBillReceive: PropTypes.func.isRequired,
  handlePrintBillReceivesOpen: PropTypes.func.isRequired,
  handleEditBillReceive: PropTypes.func.isRequired,
  handleDeleteBillReceive: PropTypes.func.isRequired,
  billReceiveKey: PropTypes.string.isRequired,
  situation: PropTypes.string.isRequired,
};

const MenuAcoes = withStyles(stylesMenu)(_MenuAcoes);

function BillReceiveTable(props) {
  const {
    classes,
    clientId,
    clientData,
    handleOpenMessage,
    handleSaveClient,
  } = props;

  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [billReceive, setBillReceive] = useState({}); //Contém o título que está sendo editado
  const [billsReceive, setbillsReceive] = useState([]); //Contém os títulos do cliente que estão sendo exibidos na página
  const [billsReceiveComplete, setbillsReceiveComplete] = useState([]); //Contém todos os títulos do cliente
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [srcIframe, setSrcIframe] = useState('');

  const [dadosMenuAcoes, setDadosMenuAcoes] = useState({
    anchorEl: null,
    billReceiveKey: '',
    situation: 0,
  });

  useEffect(() => {
    fetchBillsReceive();
    // eslint-disable-next-line
  }, [clientId]);

  useEffect(() => {
    handleChangePage(null, 0);
    // eslint-disable-next-line
  }, [billsReceiveComplete]);

  const handleOpenMenuAcoes = (billReceiveKey, situation) => event => {
    setDadosMenuAcoes({
      anchorEl: event.currentTarget,
      billReceiveKey,
      situation,
    });
  };

  function handleCloseMenuAcoes() {
    setDadosMenuAcoes({ anchorEl: null, billReceiveKey: '' });
  }

  function handleOpenCreateModal() {
    if ((clientId === 0 || clientId === '') && handleSaveClient) {
      Confirm(
        'Atenção',
        'Cliente ainda não está salvo, para continuar é preciso salvar.',
        () => handleSaveClient(() => setOpenCreateModal(true))
      );
    } else setOpenCreateModal(true);
  }

  function handleSaveBillReceive(reason, print, clientData, billReceive) {
    if (reason === 'saved') {
      setOpenEditModal(false);
      handleOpenMessage(true, 'success', 'Título pago com sucesso! ');
      if (print) {
        let blobUrl = printBillsReceiveis(clientData, billReceive);
        setSrcIframe(blobUrl);
        setOpen(true);
      }
      fetchBillsReceive();
    }
  }

  async function internalPrintBillReceives(billReceives) {
    let _clientData = clientData;
    if (!clientData) _clientData = await clientService.get(clientId);

    let blobUrl = printBillsReceiveis(_clientData, billReceives);
    setSrcIframe(blobUrl);
    setOpen(true);
  }

  function renderEditModal(bill) {
    if (openEditModal) {
      return (
        <BillReceiveEditModal
          open={openEditModal}
          bill={bill}
          onClose={() => setOpenEditModal(false)}
          handleSave={handleSaveBillReceive}
          clientData={clientData}
        />
      );
    }
  }

  function handlePrintBillReceivesOpen() {
    internalPrintBillReceives(
      billsReceiveComplete.filter(item => item.situation === 0)
    );
  }

  function handlePrintBillReceiveGroupByCode(key) {
    internalPrintBillReceives(
      billsReceiveComplete.filter(item => item.code === billsReceive[key].code)
    );
  }

  function handlePrintBillReceive(key) {
    internalPrintBillReceives([billsReceiveComplete[key]]);
  }

  function handleEditBillReceive(key) {
    setBillReceive(billsReceiveComplete[key]);
    setOpenEditModal(true);
  }

  function handleDeleteBillReceive(key) {
    Confirm('Atenção', 'Confirma a exclusão?', () =>
      billsReceiveservice
        .remove(billsReceive[key].code)
        .then(() => {
          let billsReceiveCompleteWithoutDeleted = billsReceiveComplete.filter(
            billReceive => billReceive.code !== billsReceive[key].code
          );
          setbillsReceiveComplete(billsReceiveCompleteWithoutDeleted);
        })
        .catch(error => {
          handleOpenMessage(true, 'error', getErrosFromApi(error));
        })
    );
  }

  function fetchBillsReceive() {
    if (clientId === 'clean') {
      setbillsReceiveComplete([]);
      return;
    }
    if (clientId && clientId !== '0') {
      billsReceiveservice.getBillsReceiveServiceByClient(clientId).then(res => {
        setbillsReceiveComplete(res.data);
      });
    } /*
      else
        setbillsReceive([]);*/
  }

  function onCloseCreateModal(event, reason) {
    setOpenCreateModal(false);
    if (reason === 'created') {
      handleOpenMessage(false, 'success', '');
      internalPrintBillReceives(event);
      fetchBillsReceive();
    }
  }

  function handleChangePage(event, _page) {
    setPage(_page);
    let start = _page * rowsPerPage;
    let end = start + rowsPerPage;
    setbillsReceive(billsReceiveComplete.slice(start, end));
  }

  function handleChangeRowsPerPage(event) {
    setRowsPerPage(parseInt(event.target.value));
    let start = page * parseInt(event.target.value);
    let end = start + parseInt(event.target.value);
    setbillsReceive(billsReceiveComplete.slice(start, end));
  }

  return (
    <div className={classes.container}>
      <MenuAcoes
        handleSaveClient={handleSaveClient}
        handleCloseMenuAcoes={handleCloseMenuAcoes}
        anchorElMenuAcoes={dadosMenuAcoes.anchorEl}
        handlePrintBillReceiveGroupByCode={handlePrintBillReceiveGroupByCode}
        handlePrintBillReceive={handlePrintBillReceive}
        handlePrintBillReceivesOpen={handlePrintBillReceivesOpen}
        handleEditBillReceive={handleEditBillReceive}
        handleDeleteBillReceive={handleDeleteBillReceive}
        billReceiveKey={dadosMenuAcoes.billReceiveKey}
        situation={dadosMenuAcoes.situation}
      />
      <div className={classes.flexContainer}>
        <Button
          variant="outlined"
          color="primary"
          className={classes.button}
          disabled={(clientId === '0' || clientId === '') && !handleSaveClient}
          onClick={handleOpenCreateModal}
        >
          INCLUIR
        </Button>
        {!(clientId === 0 || clientId === '') && (
          <>
            <Typography style={{ paddingLeft: 10 }}>
              Saldo devedor sem juros:{'  '}
              <span style={{ fontWeight: 600, color: 'red' }}>
                {getNumberToString(
                  billsReceiveComplete
                    .filter(b => b.situation === 0)
                    .reduce((prev, curr) => {
                      return parseFloat(curr.originalValue) + prev;
                    }, 0.0)
                )}
              </span>
            </Typography>
            <Typography style={{ paddingLeft: 10 }}>
              Saldo devedor com juros:{'  '}
              <span style={{ fontWeight: 600, color: 'red' }}>
                {getNumberToString(
                  billsReceiveComplete
                    .filter(b => b.situation === 0)
                    .reduce((prev, curr) => curr.finalValue + prev, 0.0)
                )}
              </span>
            </Typography>
          </>
        )}
      </div>
      <div className={classes.back}>
        <Table className={classes.table} size="small">
          <TableHead>
            <TableRow>
              <TableCell size="small">Data da venda</TableCell>
              <TableCell size="small">Vendedor</TableCell>
              <TableCell size="small">Título</TableCell>
              <TableCell size="small">Parcela</TableCell>
              <TableCell size="small">Data de vencimento</TableCell>
              <TableCell size="small"> Data de pagamento</TableCell>
              <TableCell size="small">Valor</TableCell>
              {/*<TableCell size="small" align="left">
                Situação
                  </TableCell>*/}
              <TableCell size="small">Valor pago/atual</TableCell>
              <TableCell size="small">Juros</TableCell>
              <TableCell size="small">Dias em atraso</TableCell>
              <TableCell size="small" align="left">
                Ações
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.keys(billsReceive).map(key => {
              return (
                <TableRow
                  className={
                    billsReceive[key].situation === 0 && classes.openRow
                  }
                  key={key}
                >
                  <TableCell size="small">
                    {getDateToString(billsReceive[key].purchaseDate)}
                  </TableCell>
                  <TableCell size="small">
                    <div className={classes.ellipses}>
                      {billsReceive[key].vendor}
                    </div>
                  </TableCell>
                  <TableCell size="small">{billsReceive[key].code}</TableCell>
                  <TableCell size="small">{billsReceive[key].quota}</TableCell>
                  <TableCell>
                    {getDateToString(billsReceive[key].dueDate)}
                  </TableCell>
                  <TableCell size="small">
                    {getDateToString(billsReceive[key].payDate)}
                  </TableCell>
                  <TableCell size="small">
                    {getNumberDecimalToStringCurrency(
                      billsReceive[key].originalValue
                    )}
                  </TableCell>
                  {/*<TableCell size="small" align="left">
{billsReceive[key].situation === 1 ? 'QUITADO' : 'ABERTO'}
</TableCell>*/}
                  <TableCell size="small">
                    {getNumberDecimalToStringCurrency(
                      billsReceive[key].finalValue
                    )}
                  </TableCell>
                  <TableCell size="small">
                    {getNumberDecimalToStringCurrency(
                      billsReceive[key].interest
                    )}
                  </TableCell>
                  <TableCell size="small">
                    {billsReceive[key].daysDelay}
                  </TableCell>
                  <TableCell size="small" align="left">
                    <Fab
                      color="primary"
                      aria-label="Delete"
                      className={classes.fab}
                      onClick={handleOpenMenuAcoes(
                        key,
                        billsReceive[key].situation
                      )}
                      size="small"
                    >
                      <TouchApp fontSize="small" />
                    </Fab>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[25, 50, 100]}
                colSpan={3}
                count={billsReceiveComplete.length}
                rowsPerPage={rowsPerPage}
                page={page}
                labelDisplayedRows={({ from, to, count }) =>
                  `Títulos ${from} até ${to} de ${count}`
                }
                labelRowsPerPage={'Títulos por página:'}
                SelectProps={{
                  native: true,
                  fontSize: 12,
                }}
                onChangePage={handleChangePage}
                onChangeRowsPerPage={handleChangeRowsPerPage}
                ActionsComponent={TablePaginationActions}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </div>
      <br />
      {renderEditModal(billReceive)}
      <BillReceiveCreateModal
        open={openCreateModal}
        onClose={onCloseCreateModal}
        clientId={clientId}
      />
      <PrintContainer open={open} setOpen={setOpen} src={srcIframe} />
    </div>
  );
}

BillReceiveTable.propTypes = {
  classes: PropTypes.object.isRequired,
  clientId: PropTypes.string.isRequired,
  handleOpenMessage: PropTypes.func.isRequired,
  handleSaveClient: PropTypes.oneOfType([PropTypes.func, PropTypes.any]),
};

export default React.memo(withStyles(styles)(BillReceiveTable));
