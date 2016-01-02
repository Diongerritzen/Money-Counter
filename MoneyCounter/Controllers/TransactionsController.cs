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

namespace MoneyCounter.Controllers
{
    public class TransactionsController : ApiController
    {
        private MoneyCounterContainer db = new MoneyCounterContainer();

        // GET: api/Transactions
        public IQueryable<Transaction> GetTransactions()
        {
            return db.Transactions;
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

            Transaction oldTransaction = 
                db.Transactions
                .Where(t => t.Id == id)
                .Include("Category")
                .Include("User")
                .FirstOrDefault();
            Transaction newTransaction = ResolveTransactionRelations(transaction);

            db.Transactions.Remove(oldTransaction);
            db.Transactions.Add(transaction);

            //db.Entry(transaction).State = EntityState.Modified;

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

            Transaction newTransaction = ResolveTransactionRelations(transaction);

            db.Transactions.Add(newTransaction);
            db.SaveChanges();

            return CreatedAtRoute("DefaultApi", new { id = newTransaction.Id }, newTransaction);
        }

        // DELETE: api/Transactions/5
        [ResponseType(typeof(Transaction))]
        public IHttpActionResult DeleteTransaction(int id)
        {
            Transaction transaction = 
                db.Transactions
                .Where(t => t.Id == id)
                .Include("Category")
                .Include("User")
                .FirstOrDefault();
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

        private Transaction ResolveTransactionRelations (Transaction transaction)
        {
            transaction.Category = db.Categories.Where(c => c.Id == transaction.Category.Id).FirstOrDefault();
            transaction.User = db.Users.Where(u => u.Id == transaction.User.Id).FirstOrDefault();

            return transaction;
        }
    }
}