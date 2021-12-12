/*
ORDER (ONo, Custid, Total amount)
Cart (CaNo, Item-no, Custid, Qty ordered, Total price)
Rating (Custid Rating)
Customer (Custid,Name)
Write a procedure using a cursor to calculate total billing amount for all customer and insert a
record in the order table. Billing amount calculation is based on items price, shipping charges
and discount amount. Discount is based on customer rating. If the rating is 5, 4 and 3 than a
discount is 10%. 7% and 5% of total purchasing amount respectively. After applying a discount,
if the total amount is less than 5000 than shipping charges is 500 added in the total billing
amount otherwise zero.
*/
create procedure proc_billing(custid int, total_amount decimal(10,2))
begin

    declare cno int;
    declare qty int;
    declare price decimal(10,2);
    declare shipping decimal(10,2);
    declare discount decimal(10,2);
    declare total decimal(10,2);
    declare rating int;
    declare cust_name varchar(20);
    declare cur1 cursor for select cno,qty,price from cart where custid=custid;
    declare cur2 cursor for select rating from rating where custid=custid;
    declare cur3 cursor for select name from customer where custid=custid;
    declare continue handler for not found set continue;

    open cur1;
    open cur2;
    open cur3;

    fetch cur1 into cno,qty,price;
    fetch cur2 into rating;
    fetch cur3 into cust_name;

    while (cno is not null)
    do
    begin
        if (rating=5 or rating=4 or rating=3)
        then
            discount=total_amount*0.1;
        else if (rating=7 or rating=5)
        then
            discount=total_amount*0.05;
        else
            discount=0;

        if (total_amount<5000)
        then
            shipping=500;
        else
            shipping=0;

        total=qty*price+shipping-discount;

        insert into order values(cno,custid,total);

        fetch cur1 into cno,qty,price;
        fetch cur2 into rating;
        fetch cur3 into cust_name;
    end loop;

    close cur1;
    close cur2;
    close cur3;
end;




