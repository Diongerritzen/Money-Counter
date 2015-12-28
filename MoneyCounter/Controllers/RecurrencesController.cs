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
    public class RecurrencesController : ApiController
    {
        private UserModelContainer db = new UserModelContainer();

        // GET: api/Recurrences
        public IQueryable<Recurrence> GetRecurrences()
        {
            return db.Recurrences;
        }

        // GET: api/Recurrences/5
        [ResponseType(typeof(Recurrence))]
        public IHttpActionResult GetRecurrence(int id)
        {
            Recurrence recurrence = db.Recurrences.Find(id);
            if (recurrence == null)
            {
                return NotFound();
            }

            return Ok(recurrence);
        }

        // PUT: api/Recurrences/5
        [ResponseType(typeof(void))]
        public IHttpActionResult PutRecurrence(int id, Recurrence recurrence)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != recurrence.Id)
            {
                return BadRequest();
            }

            db.Entry(recurrence).State = EntityState.Modified;

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!RecurrenceExists(id))
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

        // POST: api/Recurrences
        [ResponseType(typeof(Recurrence))]
        public IHttpActionResult PostRecurrence(Recurrence recurrence)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.Recurrences.Add(recurrence);
            db.SaveChanges();

            return CreatedAtRoute("DefaultApi", new { id = recurrence.Id }, recurrence);
        }

        // DELETE: api/Recurrences/5
        [ResponseType(typeof(Recurrence))]
        public IHttpActionResult DeleteRecurrence(int id)
        {
            Recurrence recurrence = db.Recurrences.Find(id);
            if (recurrence == null)
            {
                return NotFound();
            }

            db.Recurrences.Remove(recurrence);
            db.SaveChanges();

            return Ok(recurrence);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool RecurrenceExists(int id)
        {
            return db.Recurrences.Count(e => e.Id == id) > 0;
        }
    }
}