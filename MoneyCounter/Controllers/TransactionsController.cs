using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Description;
using MoneyCounter.Models;
using System.Data.Entity.Core.Objects;

namespace MoneyCounter.Controllers
{
    public class TransactionsController : ApiController
    {
        private UserModelContainer db = new UserModelContainer();

        // GET: api/Transactions
        public IQueryable<Transaction> GetTransactions()
        {
            return db.Transactions;

            //List<Transaction> transactionList = db.Transactions.ToList();
            //List<TransactionModel> transactions = new List<TransactionModel>();
            //
            //foreach (var transaction in transactionList)
            //{
            //    TransactionModel model = new TransactionModel();
            //    model.Amount = transaction.Amount;
            //    model.Date = transaction.Date;
            //    model.Description = transaction.Description;
            //    model.Type = transaction.Type;
            //    foreach (var category in transaction.Categories)
            //    {
            //
            //    }
            //    model.Categories = transaction.Categories.ToList();
            //    
            //    transactions.Add(model);
            //}
            //
            //return transactions.AsQueryable();
        }

        // GET: api/Transactions/5
        [ResponseType(typeof(Transaction))]
        public IHttpActionResult GetTransaction(int id)
        {
            Transaction transaction = db.Transactions.Find(id);
            if (transaction == null)
            {
                return NotFound();
            }

            return Ok(transaction);
        }

        // PUT: api/Transactions/5
        [ResponseType(typeof(void))]
        public IHttpActionResult PutTransaction(int id, Transaction transaction)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != transaction.Id)
            {
                return BadRequest();
            }

            db.Entry(transaction).State = EntityState.Modified;

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TransactionExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return StatusCode(HttpStatusCode.NoContent);
        }

        // POST: api/Transactions
        [ResponseType(typeof(Transaction))]
        public IHttpActionResult PostTransaction(Transaction transaction)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            Transaction newTransaction = new Transaction()
                { Amount = transaction.Amount, Date = transaction.Date, Description = transaction.Description, Type = transaction.Type };
            //newTransaction.Type = transaction.Amount < 0 ? "Expense" : "Income";
            newTransaction.User = db.Users.Where(u => u.Id == transaction.User.Id).ToList()[0];

            foreach (var category in transaction.Categories)
            {
                newTransaction.Categories.Add(db.Categories.Where(c => c.Id == category.Id).ToList()[0]);
            }

            db.Transactions.Add(newTransaction);
            db.SaveChanges();

            return CreatedAtRoute("DefaultApi", new { id = newTransaction.Id }, newTransaction);
        }

        // DELETE: api/Transactions/5
        [ResponseType(typeof(Transaction))]
        public IHttpActionResult DeleteTransaction(int id)
        {
            Transaction transaction = db.Transactions.Find(id);
            if (transaction == null)
            {
                return NotFound();
            }

            db.Transactions.Remove(transaction);
            db.SaveChanges();

            return Ok(transaction);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool TransactionExists(int id)
        {
            return db.Transactions.Count(e => e.Id == id) > 0;
        }
    }

    public class TransactionModel
    {
        public TransactionModel()
        {
            Categories = new List<Category>();
        }

        public System.DateTime Date { get; set; }
        public decimal Amount { get; set; }
        public string Type { get; set; }
        public string Description { get; set; }
        public List<Category> Categories { get; set; }
    }
}