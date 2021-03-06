//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace MoneyCounter.Models
{
    using System;
    using System.Collections.Generic;
    
    public partial class Category
    {
        public Category()
        {
            this.Color = "black";
            this.Default = false;
            this.Transactions = new HashSet<Transaction>();
            this.Recurrences = new HashSet<Recurrence>();
        }
    
        public int Id { get; set; }
        public string Name { get; set; }
        public string TransactionType { get; set; }
        public string Color { get; set; }
        public bool Default { get; set; }
    
        public virtual ICollection<Transaction> Transactions { get; set; }
        public virtual ICollection<Recurrence> Recurrences { get; set; }
        public virtual User User { get; set; }
    }
}
