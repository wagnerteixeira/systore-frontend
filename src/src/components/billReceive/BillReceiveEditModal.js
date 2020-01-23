import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { KeyboardDatePicker } from '@material-ui/pickers';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
import Fab from '@material-ui/core/Fab';
import Tooltip from '@material-ui/core/Tooltip';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

import MessageSnackbar from '../common/MessageSnackbar';
import NumberFormatCustom from '../common/NumberFormatCustom';
import ModalWrapped from '../common/Modal';
import {
  getDateToString,
  getCurrentDate,
  getValueInterest,
  getValueWithInterest,
} from '../../utils/operators';

import billsReceiveservice from '../../services/billsReceiveService';

const styles = theme => ({
  paper: {
    position: 'absolute',
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2),
    top: '50%',
    left: '50%',
    transform: 'translate(-50%,-50%)',
    outline: 'none',
    width: theme.spacing(60),
  },
  button: {
    margin: theme.spacing(1),
  },
});

class BillReceiveEditModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messageOpen: false,
      variantMessage: 'success',
      messageText: '',
      printQuota: false,
      data: {
        id: props.bill.id,
        client: props.bill.client,
        code: props.bill.code,
        quota: props.bill.quota,
        originalValue: props.bill.originalValue,
        interest:
          props.bill.payDate != null
            ? props.bill.interest
            : getValueInterest(
                props.bill.originalValue,
                props.bill.dueDate,
                getCurrentDate()
              ),
        finalValue:
          props.bill.payDate != null
            ? props.bill.finalValue
            : getValueWithInterest(
                props.bill.originalValue,
                props.bill.dueDate,
                getCurrentDate()
              ),
        purchaseDate: props.bill.purchaseDate,
        dueDate: props.bill.dueDate,
        payDate:
          props.bill.payDate != null ? props.bill.payDate : getCurrentDate(),
        daysDelay: props.bill.daysDelay,
        situation: props.bill.situation,
        vendor: props.bill.vendor,
      },
    };
  }

  handleMessageClose = () => {
    this.setState({ messageOpen: false });
  };

  handleValueChangeBill = name => event => {
    this.setState({ data: { ...this.state.data, [name]: event.target.value } });
  };

  handleValueChangeInterestBill = event => {
    this.setState({
      data: {
        ...this.state.data,
        interest: parseFloat(event.target.value),
        finalValue:
          parseFloat(this.state.data.originalValue) +
          parseFloat(event.target.value),
      },
    });
  };

  handleDateValueChangeBill = name => date => {
    this.setState({ data: { ...this.state.data, [name]: date } });
  };

  validadePay = () => {
    let message = '';
    if (!this.state.data.finalValue || this.state.data.finalValue <= 0)
      message += 'Informe o valor pago!\n\n';
    if (!this.state.data.payDate) message += 'Informe a data de pagamento!\n\n';
    return message;
  };

  handleSaveBillReceive = data => {
    let message = this.validadePay();
    if (message !== '') {
      this.setState({
        messageOpen: true,
        messageText: message,
        variantMessage: 'warning',
      });
      return;
    }
    data.situation = 1;
    data.clientId = this.props.clientData.id;
    data.client = this.props.clientData;
    billsReceiveservice
      .update(data)
      .then(res => {
        this.props.handleSave(
          'saved',
          this.state.printQuota,
          this.props.clientData,
          [{ ...res.data }]
        );
      })
      .catch(error => console.log(error.response));
  };

  handleChangeCheckBox = name => event => {
    this.setState({ [name]: event.target.checked });
  };

  handleGenerateInterest = () => {
    let value = getValueInterest(
      this.state.data.originalValue,
      this.state.data.dueDate,
      this.state.data.payDate
    );
    this.setState({
      data: {
        ...this.state.data,
        interest: parseFloat(value),
        finalValue:
          parseFloat(this.state.data.originalValue) + parseFloat(value),
      },
    });
  };

  render() {
    const { open, onClose, classes } = this.props;

    const {
      data,
      messageOpen,
      variantMessage,
      messageText,
      printQuota,
    } = this.state;

    let _originalValue = parseFloat(data.originalValue)
      .toFixed(2)
      .replace('.', ',');
    let _finalValue = parseFloat(data.finalValue)
      .toFixed(2)
      .replace('.', ',');
    let _interest_value = parseFloat(data.interest)
      .toFixed(2)
      .replace('.', ',');

    return (
      <ModalWrapped onClose={onClose} open={open} paperClass={classes.paper}>
        <MessageSnackbar
          onClose={this.handleMessageClose}
          open={messageOpen}
          variant={variantMessage}
          message={messageText}
        />
        <Grid className={classes.itens} container spacing={3}>
          <Grid
            className={classes.item}
            item
            xs={12}
            sm={12}
            md={12}
            lg={12}
            xl={12}
          >
            <Typography align="center" variant="h6">
              PAGAMENTO DE TÍTULO
            </Typography>
          </Grid>
          <Grid
            className={classes.item}
            item
            xs={12}
            sm={4}
            md={4}
            lg={4}
            xl={4}
          >
            <TextField
              id="purchaseDate"
              label="Data da venda"
              className={classes.textField}
              value={getDateToString(data.purchaseDate)}
              margin="normal"
              fullWidth
              InputProps={{
                readOnly: true,
              }}
            />
          </Grid>
          <Grid
            className={classes.item}
            item
            xs={12}
            sm={4}
            md={4}
            lg={4}
            xl={4}
          >
            <TextField
              id="dueDate"
              label="Data de vencimento"
              className={classes.textField}
              value={getDateToString(data.dueDate)}
              margin="normal"
              fullWidth
              InputProps={{
                readOnly: true,
              }}
            />
          </Grid>
          <Grid
            className={classes.item}
            item
            xs={12}
            sm={4}
            md={4}
            lg={4}
            xl={4}
          >
            <KeyboardDatePicker
              id="payDate"
              label="Data de Pagamento"
              className={classes.textField}
              value={data.payDate}
              onChange={this.handleDateValueChangeBill('payDate')}
              margin="normal"
              format={'dd/MM/yyyy'}
              fullWidth
              ref="payDate"
            />
          </Grid>
          <Grid
            className={classes.item}
            item
            xs={12}
            sm={12}
            md={12}
            lg={12}
            xl={12}
          >
            <TextField
              id="vendor"
              label="Nome do vendedor"
              className={classes.textField}
              value={data.vendor}
              onChange={this.handleValueChangeBill('vendor')}
              margin="normal"
              InputProps={{
                readOnly: true,
              }}
              fullWidth
            />
          </Grid>
          <Grid
            className={classes.item}
            item
            xs={12}
            sm={10}
            md={10}
            lg={10}
            xl={10}
          >
            <TextField
              id="code"
              label="Código"
              className={classes.textField}
              value={data.code}
              onChange={this.handleValueChangeBill('code')}
              margin="normal"
              InputProps={{
                readOnly: true,
              }}
              fullWidth
            />
          </Grid>
          <Grid
            className={classes.item}
            item
            xs={12}
            sm={2}
            md={2}
            lg={2}
            xl={2}
          >
            <TextField
              id="quota"
              label="Parcela"
              className={classes.textField}
              value={data.quota}
              onChange={this.handleValueChangeBill('quota')}
              margin="normal"
              InputProps={{
                readOnly: true,
              }}
              fullWidth
            />
          </Grid>
          <Grid
            className={classes.item}
            item
            xs={12}
            sm={5}
            md={5}
            lg={5}
            xl={5}
          >
            <TextField
              id="originalValue"
              label="Valor"
              className={classes.textField}
              value={_originalValue}
              onChange={this.handleValueChangeBill('originalValue')}
              margin="normal"
              fullWidth
              InputProps={{
                inputComponent: NumberFormatCustom,
                readOnly: true,
              }}
            />
          </Grid>
          <Grid
            className={classes.item}
            item
            xs={12}
            sm={5}
            md={5}
            lg={5}
            xl={5}
          >
            <TextField
              id="interest"
              label="Juros"
              className={classes.textField}
              value={_interest_value}
              onChange={this.handleValueChangeInterestBill}
              margin="normal"
              fullWidth
              InputProps={{
                inputComponent: NumberFormatCustom,
              }}
              ref="interest"
            />
          </Grid>
          <Grid
            container
            alignItems="center"
            justify="center"
            className={classes.item}
            item
            xs={12}
            sm={2}
            md={2}
            lg={2}
            xl={2}
          >
            <Tooltip
              title="Calcular juros"
              placement={'bottom-start'}
              enterDelay={300}
            >
              <Fab
                color="primary"
                aria-label="Calcular juros"
                size="small"
                onClick={this.handleGenerateInterest}
              >
                <AttachMoneyIcon />
              </Fab>
            </Tooltip>
          </Grid>
          <Grid
            className={classes.item}
            item
            xs={12}
            sm={5}
            md={5}
            lg={5}
            xl={5}
          >
            <TextField
              id="finalValue"
              label="Valor pago"
              className={classes.textField}
              value={_finalValue}
              onChange={this.handleValueChangeBill('finalValue')}
              margin="normal"
              fullWidth
              InputProps={{
                inputComponent: NumberFormatCustom,
              }}
              ref="finalValue"
            />
          </Grid>
          <Grid
            className={classes.item}
            item
            xs={12}
            sm={5}
            md={5}
            lg={5}
            xl={5}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={printQuota}
                  onChange={this.handleChangeCheckBox('printQuota')}
                  value="printQuota"
                  color="primary"
                />
              }
              label="Imprimir parcela"
            />
          </Grid>
        </Grid>
        <div>
          <Button
            variant="outlined"
            color="primary"
            className={classes.button}
            onClick={() => this.handleSaveBillReceive(this.state.data)}
          >
            Salvar
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            className={classes.button}
            onClick={onClose}
          >
            Cancelar
          </Button>
        </div>
      </ModalWrapped>
    );
  }
}

BillReceiveEditModal.propTypes = {
  classes: PropTypes.object.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  handleSave: PropTypes.func.isRequired,
  bill: PropTypes.object.isRequired,
  clientData: PropTypes.object.isRequired,
};

export default withStyles(styles)(BillReceiveEditModal);
