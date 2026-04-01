const { pool } = require('../database/db');
const midtransClient = require('midtrans-client');

class PaymentController {
  static async handleNotification(req, res) {
    let apiClient = new midtransClient.Snap({
      isProduction: false,
      serverKey: 'SB-Mid-server-TOq1a2AVuiyhhOjvfs33_m3w',
      clientKey: 'SB-Mid-client-WNbvJ_iA8P4oR40V'
    });

    try {
      const notificationJson = req.body;
      const statusResponse = await apiClient.transaction.notification(notificationJson);

      let orderId = statusResponse.order_id;
      let transactionStatus = statusResponse.transaction_status;
      let fraudStatus = statusResponse.fraud_status;

      let paymentStatus = 'pending';

      if (transactionStatus == 'capture') {
        if (fraudStatus == 'challenge') {
          paymentStatus = 'pending';
        } else if (fraudStatus == 'accept') {
          paymentStatus = 'completed';
        }
      } else if (transactionStatus == 'settlement') {
        paymentStatus = 'completed';
      } else if (
        transactionStatus == 'cancel' ||
        transactionStatus == 'deny' ||
        transactionStatus == 'expire'
      ) {
        paymentStatus = 'failed';
      } else if (transactionStatus == 'pending') {
        paymentStatus = 'pending';
      }

      // the orderId typically is `Rental-${rentalId}`
      const rentalId = orderId.split('-')[1];

      if (rentalId && paymentStatus !== 'pending') {
        await pool.query(
          'UPDATE rentals SET payment_status = ? WHERE id = ?',
          [paymentStatus, rentalId]
        );
      }

      res.status(200).json({ status: 'OK' });
    } catch (e) {
      console.error('Error handling midtrans notification:', e);
      res.status(500).json({ status: 'Error', message: e.message });
    }
  }
}

module.exports = PaymentController;
